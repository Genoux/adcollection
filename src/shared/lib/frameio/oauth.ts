import { frameioConfig, redirectUri } from "@/shared/lib/frameio/config";
import { FrameioError } from "@/shared/lib/frameio/errors";

const IMS_AUTHORIZE_URL = "https://ims-na1.adobelogin.com/ims/authorize/v2";
const IMS_TOKEN_URL = "https://ims-na1.adobelogin.com/ims/token/v3";

/**
 * IMS wants these comma-delimited on /authorize, unlike the space-delimited form
 * the server-to-server flow uses. `offline_access` is what produces a refresh
 * token; without it the connection would die an hour after it is made.
 */
const SCOPES = "offline_access,openid,email,profile,additional_info.roles";

// Renew a little early so a token cannot expire between the check and the call.
const REFRESH_SKEW_MS = 60_000;

export type FrameioTokens = {
  accessToken: string;
  expiresAt: Date;
  refreshToken: string;
};

export function authorizeUrl(state: string) {
  const url = new URL(IMS_AUTHORIZE_URL);

  url.searchParams.set("client_id", frameioConfig().FRAMEIO_CLIENT_ID);
  url.searchParams.set("redirect_uri", redirectUri());
  url.searchParams.set("scope", SCOPES);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", state);

  return url.toString();
}

async function requestTokens(body: Record<string, string>): Promise<FrameioTokens> {
  const config = frameioConfig();

  const response = await fetch(IMS_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      ...body,
      client_id: config.FRAMEIO_CLIENT_ID,
      client_secret: config.FRAMEIO_CLIENT_SECRET,
    }),
  });

  if (!response.ok) {
    throw new FrameioError(
      `adobe ims token request failed: ${response.status} ${await response.text()}`,
      response.status,
    );
  }

  const token = (await response.json()) as {
    access_token: string;
    expires_in: number;
    refresh_token?: string;
  };

  if (!token.refresh_token) {
    throw new FrameioError(
      "adobe ims returned no refresh token. Check that the offline_access scope is enabled on the OAuth Web App credential.",
    );
  }

  return {
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    expiresAt: new Date(Date.now() + token.expires_in * 1000 - REFRESH_SKEW_MS),
  };
}

export const exchangeCode = (code: string) =>
  requestTokens({ grant_type: "authorization_code", code, redirect_uri: redirectUri() });

/**
 * IMS rotates the refresh token roughly weekly and invalidates the one that was
 * sent, so the caller must persist the returned pair rather than only the access
 * token. Dropping it strands the connection at the next rotation.
 */
export const refreshTokens = (refreshToken: string) =>
  requestTokens({ grant_type: "refresh_token", refresh_token: refreshToken });
