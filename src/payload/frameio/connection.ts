import { randomBytes } from "node:crypto";
import type { BasePayload } from "payload";
import type { FrameioConnection } from "@/payload-types";
import type { FrameioAuth } from "@/shared/lib/frameio/client";
import { listAccounts } from "@/shared/lib/frameio/client";
import { FrameioError } from "@/shared/lib/frameio/errors";
import { authorizeUrl, exchangeCode, refreshTokens } from "@/shared/lib/frameio/oauth";

const AUTH_STATE_TTL_MS = 10 * 60 * 1000;

export class FrameioNotConnectedError extends FrameioError {}

const userId = (connection: FrameioConnection) =>
  typeof connection.user === "number" ? connection.user : connection.user.id;

async function findByUser(payload: BasePayload, user: number) {
  const { docs } = await payload.find({
    collection: "frameio-connections",
    where: { user: { equals: user } },
    limit: 1,
    pagination: false,
    depth: 0,
    overrideAccess: true,
  });

  return docs[0] ?? null;
}

/**
 * Returns the Adobe URL the human has to visit. The state is stored rather than
 * signed so it can be invalidated on use, which stops a leaked callback URL from
 * being replayed into someone else's connection.
 */
export async function beginConnection(payload: BasePayload, user: number) {
  const state = randomBytes(32).toString("base64url");
  const existing = await findByUser(payload, user);

  const data = {
    authState: state,
    authStateExpiresAt: new Date(Date.now() + AUTH_STATE_TTL_MS).toISOString(),
  };

  if (existing) {
    await payload.update({
      collection: "frameio-connections",
      id: existing.id,
      data,
      overrideAccess: true,
    });
  } else {
    await payload.create({
      collection: "frameio-connections",
      data: { user, ...data },
      overrideAccess: true,
    });
  }

  return authorizeUrl(state);
}

export async function completeConnection(payload: BasePayload, state: string, code: string) {
  const { docs } = await payload.find({
    collection: "frameio-connections",
    where: { authState: { equals: state } },
    limit: 1,
    pagination: false,
    depth: 0,
    overrideAccess: true,
  });

  const connection = docs[0];

  if (!connection?.authStateExpiresAt) {
    throw new FrameioError("this sign-in link is not valid. Start the connection again.");
  }

  if (new Date(connection.authStateExpiresAt).getTime() < Date.now()) {
    throw new FrameioError("this sign-in link has expired. Start the connection again.");
  }

  const tokens = await exchangeCode(code);
  const accounts = await listAccounts(tokens.accessToken).catch((error: unknown) => {
    // IMS happily issues tokens to any Adobe ID; Frame.io only accepts ones linked
    // to a Frame.io user, so a 401 here means the wrong identity, not a bad token.
    if (error instanceof FrameioError && error.status === 401) {
      throw new FrameioError(
        "the Adobe account you signed in with is not linked to a Frame.io user. In Frame.io, open Profile → Authentication and connect Adobe Authentication, then sign out at account.adobe.com and connect again.",
        401,
      );
    }
    throw error;
  });
  const account = accounts[0];

  if (!account) {
    throw new FrameioError(
      "your Adobe account is not a member of any Frame.io account, so there is nothing to import from.",
    );
  }

  const accountName = account.display_name ?? account.id;

  await payload.update({
    collection: "frameio-connections",
    id: connection.id,
    overrideAccess: true,
    data: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt.toISOString(),
      accountId: account.id,
      accountName,
      authState: null,
      authStateExpiresAt: null,
    },
  });

  return { accountName, userId: userId(connection) };
}

/**
 * Two concurrent callers can both refresh and one rotated token is then discarded.
 * IMS keeps the newest valid, so the loser simply refreshes again on its next call
 * rather than failing — cheap enough that locking is not worth the complexity.
 */
export async function authForUser(payload: BasePayload, user: number): Promise<FrameioAuth> {
  const connection = await findByUser(payload, user);

  if (!connection?.refreshToken || !connection.accountId) {
    throw new FrameioNotConnectedError("frame.io is not connected for this user.");
  }

  const stillValid =
    connection.accessToken &&
    connection.expiresAt &&
    new Date(connection.expiresAt).getTime() > Date.now();

  if (stillValid && connection.accessToken) {
    return { accessToken: connection.accessToken, accountId: connection.accountId };
  }

  let tokens: Awaited<ReturnType<typeof refreshTokens>>;

  try {
    tokens = await refreshTokens(connection.refreshToken);
  } catch (error) {
    // A dead refresh token is unrecoverable without the human, so clear it and let
    // the caller send them back through the connect flow.
    await payload.update({
      collection: "frameio-connections",
      id: connection.id,
      overrideAccess: true,
      data: { accessToken: null, refreshToken: null, expiresAt: null },
    });

    throw new FrameioNotConnectedError(
      `your frame.io connection expired and could not be renewed (${error instanceof Error ? error.message : "unknown error"}).`,
    );
  }

  await payload.update({
    collection: "frameio-connections",
    id: connection.id,
    overrideAccess: true,
    data: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt.toISOString(),
    },
  });

  return { accessToken: tokens.accessToken, accountId: connection.accountId };
}

export async function disconnect(payload: BasePayload, user: number) {
  const connection = await findByUser(payload, user);
  if (!connection) return;

  await payload.delete({
    collection: "frameio-connections",
    id: connection.id,
    overrideAccess: true,
  });
}

export type ConnectionStatus =
  | { accountName: string; renewedAt: string; state: "connected" }
  | { accountName: string; state: "expired" }
  | { state: "disconnected" };

/**
 * A row that has an account but no refresh token is one whose renewal was
 * rejected by IMS; it is reported separately so the UI can say "reconnect"
 * rather than implying the user never connected.
 */
export async function connectionStatus(
  payload: BasePayload,
  user: number,
): Promise<ConnectionStatus> {
  const connection = await findByUser(payload, user);

  if (!connection?.accountId) return { state: "disconnected" };

  const accountName = connection.accountName ?? connection.accountId;

  if (!connection.refreshToken) return { accountName, state: "expired" };

  return { accountName, renewedAt: connection.updatedAt, state: "connected" };
}
