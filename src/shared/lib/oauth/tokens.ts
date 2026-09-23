import { createHash, randomBytes } from "node:crypto";

// Prefixes let the MCP endpoint route a bearer token to OAuth or API-key auth
// without a database lookup, and make leaked tokens greppable by secret scanners.
export const ACCESS_TOKEN_PREFIX = "adc_at_";
export const REFRESH_TOKEN_PREFIX = "adc_rt_";
export const CODE_PREFIX = "adc_code_";

export const newToken = (prefix: string) => `${prefix}${randomBytes(32).toString("base64url")}`;

// Plain SHA-256 rather than a password hash: these are 256-bit random values, so
// there is nothing to brute-force and lookups must stay a single indexed equality.
export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
