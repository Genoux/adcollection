import type { BasePayload, Where } from "payload";
import { z } from "zod";
import { isOwnResource, issuerUrl } from "@/payload/mcp/oauth/urls";
import type { McpOauthClient } from "@/payload-types";
import { verifyPkce } from "@/shared/lib/oauth/pkce";
import { isRegistrableRedirectUri, redirectUriMatches } from "@/shared/lib/oauth/redirect-uri";
import {
  ACCESS_TOKEN_PREFIX,
  CODE_PREFIX,
  hashToken,
  newToken,
  REFRESH_TOKEN_PREFIX,
} from "@/shared/lib/oauth/tokens";

const CODE_TTL_MS = 5 * 60_000;
const ACCESS_TTL_S = 60 * 60;
const REFRESH_TTL_MS = 30 * 24 * 60 * 60_000;

export type OAuthErrorCode =
  | "access_denied"
  | "invalid_client"
  | "invalid_client_metadata"
  | "invalid_grant"
  | "invalid_redirect_uri"
  | "invalid_request"
  | "invalid_target"
  | "unsupported_grant_type"
  | "unsupported_response_type";

export class OAuthError extends Error {
  constructor(
    readonly code: OAuthErrorCode,
    message: string,
  ) {
    super(message);
  }
}

export type TokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  token_type: "Bearer";
};

const later = (ms: number) => new Date(Date.now() + ms).toISOString();
const isPast = (iso: null | string | undefined) => !iso || new Date(iso).getTime() <= Date.now();
const idOf = (value: number | { id: number }) => (typeof value === "object" ? value.id : value);
const redirectUrisOf = (client: McpOauthClient) => client.redirectUris as string[];

const findGrant = async (payload: BasePayload, where: Where) =>
  (
    await payload.find({
      collection: "mcp-oauth-grants",
      depth: 0,
      limit: 1,
      pagination: false,
      where,
    })
  ).docs[0] ?? null;

export async function findClient(payload: BasePayload, clientId: string) {
  const { docs } = await payload.find({
    collection: "mcp-oauth-clients",
    limit: 1,
    pagination: false,
    where: { clientId: { equals: clientId } },
  });
  return docs[0] ?? null;
}

const registrationSchema = z.object({
  client_name: z.string().max(200).optional(),
  redirect_uris: z.array(z.string()).min(1).max(10),
});

export async function registerClient(payload: BasePayload, metadata: unknown) {
  const parsed = registrationSchema.safeParse(metadata);
  if (!parsed.success) {
    throw new OAuthError("invalid_client_metadata", z.prettifyError(parsed.error));
  }

  const { client_name, redirect_uris } = parsed.data;
  const rejected = redirect_uris.filter((uri) => !isRegistrableRedirectUri(uri));
  if (rejected.length > 0) {
    throw new OAuthError(
      "invalid_redirect_uri",
      `redirect URIs must be https, loopback http, or an app scheme: ${rejected.join(", ")}`,
    );
  }

  const client = await payload.create({
    collection: "mcp-oauth-clients",
    data: { clientId: crypto.randomUUID(), clientName: client_name, redirectUris: redirect_uris },
  });

  return {
    client_id: client.clientId,
    client_id_issued_at: Math.floor(new Date(client.createdAt).getTime() / 1000),
    client_name: client.clientName ?? undefined,
    grant_types: ["authorization_code", "refresh_token"],
    redirect_uris,
    response_types: ["code"],
    token_endpoint_auth_method: "none",
  };
}

export type AuthorizationRequest = {
  client: McpOauthClient;
  codeChallenge: string;
  redirectUri: string;
  state: null | string;
};

export type ParsedAuthorization =
  | { ok: true; request: AuthorizationRequest }
  // Without a verified client and redirect URI there is nowhere safe to send the
  // error, so the user sees it instead (RFC 6749 §4.1.2.1).
  | { ok: false; error: OAuthError; redirectTo: null }
  | { ok: false; error: OAuthError; redirectTo: string };

export function authorizationRedirect(
  redirectUri: string,
  params: Record<string, null | string | undefined>,
) {
  const url = new URL(redirectUri);
  // RFC 9207 issuer identification, which lets clients reject mix-up attacks.
  for (const [key, value] of Object.entries({ ...params, iss: issuerUrl() })) {
    if (value) url.searchParams.set(key, value);
  }
  return url.toString();
}

export async function parseAuthorizationRequest(
  payload: BasePayload,
  params: URLSearchParams,
): Promise<ParsedAuthorization> {
  const clientId = params.get("client_id");
  const client = clientId ? await findClient(payload, clientId) : null;
  if (!client) {
    return {
      ok: false,
      error: new OAuthError("invalid_client", "this MCP client is not registered. Reconnect it."),
      redirectTo: null,
    };
  }

  const registered = redirectUrisOf(client);
  const redirectUri =
    params.get("redirect_uri") ?? (registered.length === 1 ? registered[0] : null);
  if (!redirectUri || !redirectUriMatches(registered, redirectUri)) {
    return {
      ok: false,
      error: new OAuthError("invalid_redirect_uri", "the redirect URI was not registered."),
      redirectTo: null,
    };
  }

  const state = params.get("state");
  const fail = (code: OAuthErrorCode, message: string): ParsedAuthorization => ({
    ok: false,
    error: new OAuthError(code, message),
    redirectTo: authorizationRedirect(redirectUri, {
      error: code,
      error_description: message,
      state,
    }),
  });

  if (params.get("response_type") !== "code") {
    return fail("unsupported_response_type", "only response_type=code is supported.");
  }

  const codeChallenge = params.get("code_challenge");
  if (!codeChallenge || params.get("code_challenge_method") !== "S256") {
    return fail("invalid_request", "PKCE with code_challenge_method=S256 is required.");
  }

  if (!isOwnResource(params.get("resource"))) {
    return fail("invalid_target", "tokens can only be issued for this MCP server.");
  }

  return { ok: true, request: { client, codeChallenge, redirectUri, state } };
}

export async function issueCode(payload: BasePayload, user: number, request: AuthorizationRequest) {
  // Abandoned consent screens leave code-only rows behind; sweeping them here keeps
  // the table bounded without a scheduled job.
  await payload.delete({
    collection: "mcp-oauth-grants",
    where: {
      and: [
        { accessTokenHash: { exists: false } },
        { codeExpiresAt: { less_than: new Date().toISOString() } },
      ],
    },
  });

  const code = newToken(CODE_PREFIX);

  await payload.create({
    collection: "mcp-oauth-grants",
    data: {
      client: request.client.id,
      codeChallenge: request.codeChallenge,
      codeExpiresAt: later(CODE_TTL_MS),
      codeHash: hashToken(code),
      redirectUri: request.redirectUri,
      user,
    },
  });

  return code;
}

async function issueTokens(
  payload: BasePayload,
  grantId: number,
  data: Record<string, null | string> = {},
): Promise<TokenResponse> {
  const accessToken = newToken(ACCESS_TOKEN_PREFIX);
  const refreshToken = newToken(REFRESH_TOKEN_PREFIX);

  await payload.update({
    collection: "mcp-oauth-grants",
    id: grantId,
    data: {
      ...data,
      accessExpiresAt: later(ACCESS_TTL_S * 1000),
      accessTokenHash: hashToken(accessToken),
      refreshExpiresAt: later(REFRESH_TTL_MS),
      refreshTokenHash: hashToken(refreshToken),
    },
  });

  return {
    access_token: accessToken,
    expires_in: ACCESS_TTL_S,
    refresh_token: refreshToken,
    token_type: "Bearer",
  };
}

async function assertClientOwns(payload: BasePayload, clientId: string, grantClient: number) {
  const client = await findClient(payload, clientId);
  if (client?.id !== grantClient) {
    throw new OAuthError("invalid_grant", "this grant belongs to a different client.");
  }
}

export async function redeemCode(
  payload: BasePayload,
  input: { clientId: string; code: string; codeVerifier: string; redirectUri: string },
) {
  const grant = await findGrant(payload, { codeHash: { equals: hashToken(input.code) } });

  if (!grant || isPast(grant.codeExpiresAt)) {
    throw new OAuthError("invalid_grant", "the authorization code is invalid or expired.");
  }
  await assertClientOwns(payload, input.clientId, idOf(grant.client));
  if (grant.redirectUri !== input.redirectUri) {
    throw new OAuthError("invalid_grant", "redirect_uri does not match the authorization request.");
  }
  if (!grant.codeChallenge || !verifyPkce(input.codeVerifier, grant.codeChallenge)) {
    throw new OAuthError("invalid_grant", "the PKCE code_verifier is invalid.");
  }

  return issueTokens(payload, grant.id, {
    codeChallenge: null,
    codeExpiresAt: null,
    codeHash: null,
  });
}

export async function refreshGrant(
  payload: BasePayload,
  input: { clientId: string; refreshToken: string },
) {
  const hash = hashToken(input.refreshToken);
  const grant = await findGrant(payload, { refreshTokenHash: { equals: hash } });

  if (grant) {
    if (isPast(grant.refreshExpiresAt)) {
      throw new OAuthError("invalid_grant", "the session expired. Sign in again.");
    }
    await assertClientOwns(payload, input.clientId, idOf(grant.client));
    return issueTokens(payload, grant.id, { previousRefreshTokenHash: hash });
  }

  // A rotated-out token coming back means two parties hold it (OAuth 2.1 §4.3.1),
  // so the whole session goes. The cost is that a client retrying a refresh whose
  // response it lost gets signed out, which is the accepted trade.
  const replayed = await findGrant(payload, { previousRefreshTokenHash: { equals: hash } });
  if (replayed) {
    await payload.delete({ collection: "mcp-oauth-grants", id: replayed.id });
  }

  throw new OAuthError("invalid_grant", "the refresh token is invalid. Sign in again.");
}

export async function userIdForAccessToken(payload: BasePayload, accessToken: string) {
  const grant = await findGrant(payload, { accessTokenHash: { equals: hashToken(accessToken) } });
  return grant && !isPast(grant.accessExpiresAt) ? idOf(grant.user) : null;
}

export async function listSessions(payload: BasePayload, user: number) {
  const { docs } = await payload.find({
    collection: "mcp-oauth-grants",
    depth: 1,
    pagination: false,
    sort: "-createdAt",
    where: {
      and: [{ user: { equals: user } }, { refreshExpiresAt: { greater_than: new Date() } }],
    },
  });

  return docs.map((grant) => ({
    clientName:
      typeof grant.client === "object" ? (grant.client.clientName ?? "MCP client") : "MCP client",
    id: grant.id,
    signedInAt: grant.createdAt,
  }));
}

export async function revokeSession(payload: BasePayload, user: number, grantId: number) {
  await payload.delete({
    collection: "mcp-oauth-grants",
    where: { and: [{ id: { equals: grantId } }, { user: { equals: user } }] },
  });
}
