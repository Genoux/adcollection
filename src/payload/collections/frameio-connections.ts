import type { CollectionConfig } from "payload";
import { localApiOnly } from "@/payload/access";

export const FrameioConnections: CollectionConfig = {
  slug: "frameio-connections",
  // Every row holds a live Adobe credential that can read the owning user's whole
  // Frame.io account, so nothing reaches it over REST, GraphQL or the admin UI.
  // The OAuth callback and the MCP tools are the only writers, via the Local API.
  access: localApiOnly,
  admin: { hidden: true },
  fields: [
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      required: true,
      unique: true,
      index: true,
    },
    { name: "accessToken", type: "text" },
    // IMS rotates this roughly weekly and invalidates the previous value, so every
    // refresh must persist the new one or the connection dies at the next renewal.
    { name: "refreshToken", type: "text" },
    { name: "expiresAt", type: "date" },
    {
      name: "accountId",
      type: "text",
      admin: { description: "Discovered from /v4/accounts when the connection is made." },
    },
    { name: "accountName", type: "text" },
    // Correlates the browser finishing the OAuth round trip with the user who asked
    // for the link. Single use: the callback clears it once redeemed.
    { name: "authState", type: "text", index: true },
    { name: "authStateExpiresAt", type: "date" },
  ],
};
