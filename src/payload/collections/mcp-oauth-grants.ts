import type { CollectionConfig } from "payload";
import { localApiOnly } from "@/payload/access";

// One row per signed-in MCP client install. It starts life holding only an
// authorization code and becomes a session once the code is redeemed. Only SHA-256
// hashes are stored, so a database leak does not hand out working tokens.
export const McpOauthGrants: CollectionConfig = {
  slug: "mcp-oauth-grants",
  access: localApiOnly,
  admin: { hidden: true },
  fields: [
    { name: "user", type: "relationship", relationTo: "users", required: true, index: true },
    {
      name: "client",
      type: "relationship",
      relationTo: "mcp-oauth-clients",
      required: true,
      index: true,
    },
    { name: "redirectUri", type: "text", required: true },
    { name: "codeHash", type: "text", index: true },
    { name: "codeChallenge", type: "text" },
    { name: "codeExpiresAt", type: "date" },
    { name: "accessTokenHash", type: "text", index: true },
    { name: "accessExpiresAt", type: "date" },
    { name: "refreshTokenHash", type: "text", index: true },
    // Kept one rotation back so a replayed refresh token can be recognised as theft.
    { name: "previousRefreshTokenHash", type: "text", index: true },
    { name: "refreshExpiresAt", type: "date" },
  ],
};
