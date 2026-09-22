import type { MCPAccessSettings, MCPPluginConfig } from "@payloadcms/plugin-mcp";
import { definePlugin, UnauthorizedError } from "payload";
import { mcpTools } from "@/payload/mcp";
import { mcpCollections } from "@/payload/mcp/collections";
import { userIdForAccessToken } from "@/payload/mcp/oauth/grants";
import { resourceMetadataUrl } from "@/payload/mcp/oauth/urls";
import { ACCESS_TOKEN_PREFIX } from "@/shared/lib/oauth/tokens";

// Mirrors the plugin's internal key derivation (plugin-mcp utils/camelCase), which
// is how it looks up both collection and custom-tool permissions.
const toCamelCase = (value: string) =>
  value
    .replace(/[-_\s]+(.)?/g, (_, chr: string | undefined) => (chr ? chr.toUpperCase() : ""))
    .replace(/^(.)/, (_, chr: string) => chr.toLowerCase());

/**
 * OAuth sessions get every capability the plugin is configured to expose; there is
 * no per-session checkbox matrix as with API keys. What a user can actually touch
 * is still bounded by collection access control, because tools run as that user.
 */
const oauthAccessSettings = (user: MCPAccessSettings["user"]): MCPAccessSettings => ({
  ...Object.fromEntries(
    Object.entries(mcpCollections).map(([slug, { enabled }]) => [toCamelCase(slug), enabled]),
  ),
  "payload-mcp-tool": Object.fromEntries(mcpTools.map(({ name }) => [toCamelCase(name), true])),
  user,
});

const bearerToken = (headers: Headers) => {
  const authorization = headers.get("authorization");
  return authorization?.startsWith("Bearer ") ? authorization.slice(7).trim() : null;
};

export const mcpOverrideAuth: MCPPluginConfig["overrideAuth"] = async (req, apiKeySettings) => {
  const token = bearerToken(req.headers);
  if (!token?.startsWith(ACCESS_TOKEN_PREFIX)) return apiKeySettings();

  const userId = await userIdForAccessToken(req.payload, token);
  if (!userId) throw new UnauthorizedError();

  const user = await req.payload.findByID({ collection: "users", depth: 0, id: userId });
  // `_strategy` is untyped in Payload but set by every auth strategy, the plugin's included.
  const sessionUser = { ...user, _strategy: "mcp-oauth", collection: "users" as const };

  return oauthAccessSettings(sessionUser);
};

const challenge = () =>
  Response.json(
    { error: "invalid_token", error_description: "sign in to use this MCP server." },
    {
      headers: { "WWW-Authenticate": `Bearer resource_metadata="${resourceMetadataUrl()}"` },
      status: 401,
    },
  );

const isUnauthorized = (error: unknown) =>
  error instanceof UnauthorizedError ||
  (typeof error === "object" && error !== null && "status" in error && error.status === 401);

/**
 * The plugin reports a missing or bad credential as a bare 401. MCP clients only
 * start the OAuth flow when that 401 names the resource metadata URL in
 * WWW-Authenticate (MCP authorization spec, 2025-11-25), so the endpoint is wrapped.
 */
export const mcpAuthChallenge = definePlugin({
  slug: "adcollection/mcp-auth-challenge",
  // plugin-mcp declares order 10; anything lower runs before its endpoints exist.
  order: 20,
  plugin: ({ config }) => ({
    ...config,
    endpoints: config.endpoints?.map((endpoint) =>
      endpoint.path === "/mcp"
        ? {
            ...endpoint,
            handler: async (req) => {
              try {
                return await endpoint.handler(req);
              } catch (error) {
                if (isUnauthorized(error)) return challenge();
                throw error;
              }
            },
          }
        : endpoint,
    ),
  }),
});
