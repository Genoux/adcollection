import { createHash, timingSafeEqual } from "node:crypto";

const VERIFIER = /^[A-Za-z0-9\-._~]{43,128}$/;

// S256 only: OAuth 2.1 and the MCP authorization spec both forbid `plain`.
export function verifyPkce(verifier: string, challenge: string) {
  if (!VERIFIER.test(verifier)) return false;

  const expected = Buffer.from(createHash("sha256").update(verifier).digest("base64url"));
  const actual = Buffer.from(challenge);

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
