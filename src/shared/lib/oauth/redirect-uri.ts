const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

// Schemes a browser would execute or read locally instead of handing to an app.
const UNSAFE_SCHEMES = new Set(["javascript:", "data:", "file:", "vbscript:", "blob:", "about:"]);

const parse = (uri: string) => {
  try {
    return new URL(uri);
  } catch {
    return null;
  }
};

const isLoopback = (url: URL) => url.protocol === "http:" && LOOPBACK_HOSTS.has(url.hostname);

/**
 * MCP clients are native apps, so besides https this accepts loopback http
 * (Claude Code, MCP Inspector) and private-use schemes like cursor:// (RFC 8252).
 */
export function isRegistrableRedirectUri(uri: string) {
  const url = parse(uri);
  if (!url || url.hash) return false;
  if (url.protocol === "https:") return true;
  if (url.protocol === "http:") return isLoopback(url);
  return !UNSAFE_SCHEMES.has(url.protocol);
}

/**
 * Exact match, except that loopback ports are ignored: RFC 8252 §7.3 has native
 * apps bind an ephemeral port per sign-in, which cannot be known at registration.
 */
export function redirectUriMatches(registered: string[], requested: string) {
  if (registered.includes(requested)) return true;

  const target = parse(requested);
  if (!target || !isLoopback(target)) return false;

  return registered.some((uri) => {
    const candidate = parse(uri);
    return (
      candidate !== null &&
      isLoopback(candidate) &&
      candidate.hostname === target.hostname &&
      candidate.pathname === target.pathname &&
      candidate.search === target.search
    );
  });
}
