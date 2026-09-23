import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyPkce } from "./pkce";
import { isRegistrableRedirectUri, redirectUriMatches } from "./redirect-uri";
import { ACCESS_TOKEN_PREFIX, hashToken, newToken } from "./tokens";

const challengeFor = (verifier: string) =>
  createHash("sha256").update(verifier).digest("base64url");

describe("verifyPkce", () => {
  const verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";

  it("accepts the verifier that produced the challenge", () => {
    expect(verifyPkce(verifier, challengeFor(verifier))).toBe(true);
  });

  it("rejects a different verifier", () => {
    expect(verifyPkce(`${verifier.slice(0, -1)}x`, challengeFor(verifier))).toBe(false);
  });

  it("rejects verifiers shorter than RFC 7636 allows", () => {
    const short = "abc";
    expect(verifyPkce(short, challengeFor(short))).toBe(false);
  });
});

describe("isRegistrableRedirectUri", () => {
  it.each([
    "https://claude.ai/api/mcp/auth_callback",
    "http://127.0.0.1:33418/callback",
    "http://localhost:6274/oauth/callback",
    "cursor://anysphere.cursor-mcp/oauth/callback",
  ])("allows %s", (uri) => {
    expect(isRegistrableRedirectUri(uri)).toBe(true);
  });

  it.each([
    "http://evil.example/callback",
    "javascript:alert(1)",
    "data:text/html,hi",
    "https://example.com/cb#fragment",
    "not a url",
  ])("rejects %s", (uri) => {
    expect(isRegistrableRedirectUri(uri)).toBe(false);
  });
});

describe("redirectUriMatches", () => {
  it("matches exactly", () => {
    expect(redirectUriMatches(["cursor://a/cb"], "cursor://a/cb")).toBe(true);
  });

  it("ignores the port on loopback redirects", () => {
    expect(redirectUriMatches(["http://127.0.0.1:1000/cb"], "http://127.0.0.1:5555/cb")).toBe(true);
  });

  it("still requires the same loopback path and host", () => {
    expect(redirectUriMatches(["http://127.0.0.1:1000/cb"], "http://127.0.0.1:1000/other")).toBe(
      false,
    );
    expect(redirectUriMatches(["http://127.0.0.1:1000/cb"], "http://localhost:1000/cb")).toBe(
      false,
    );
  });

  it("never relaxes the port for non-loopback hosts", () => {
    expect(redirectUriMatches(["https://a.example/cb"], "https://a.example:8443/cb")).toBe(false);
  });
});

describe("tokens", () => {
  it("prefixes and randomises tokens", () => {
    const a = newToken(ACCESS_TOKEN_PREFIX);
    expect(a.startsWith(ACCESS_TOKEN_PREFIX)).toBe(true);
    expect(a).not.toBe(newToken(ACCESS_TOKEN_PREFIX));
  });

  it("hashes deterministically", () => {
    expect(hashToken("x")).toBe(hashToken("x"));
    expect(hashToken("x")).not.toBe(hashToken("y"));
  });
});
