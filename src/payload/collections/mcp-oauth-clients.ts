import type { CollectionConfig } from "payload";
import { localApiOnly } from "@/payload/access";

// Rows are created anonymously through RFC 7591 dynamic registration, so they
// identify an app, never a person; authority lives on the grants that point here.
export const McpOauthClients: CollectionConfig = {
  slug: "mcp-oauth-clients",
  access: localApiOnly,
  admin: { hidden: true },
  fields: [
    { name: "clientId", type: "text", required: true, unique: true, index: true },
    { name: "clientName", type: "text" },
    { name: "redirectUris", type: "json", required: true },
  ],
};
