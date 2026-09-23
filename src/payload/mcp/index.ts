import type { MCPPluginConfig } from "@payloadcms/plugin-mcp";
import type { McpTool } from "@/payload/mcp/lib/tool";
import { frameioBrowse } from "@/payload/mcp/tools/browse";
import { importFrameioAd } from "@/payload/mcp/tools/import-ad";
import { frameioInspectFile } from "@/payload/mcp/tools/inspect-file";

type PluginTools = NonNullable<NonNullable<MCPPluginConfig["mcp"]>["tools"]>;

const tools: McpTool[] = [frameioBrowse, frameioInspectFile, importFrameioAd];

/**
 * Each tool name becomes a camelCased checkbox column on `payload-mcp-api-keys`,
 * so renaming or adding a tool is a schema change that needs a migration.
 *
 * The cast bridges zod 4 (this project) to the zod 3 `ZodRawShape` in the plugin's
 * signature. Only the type is incompatible: the MCP SDK underneath detects the zod
 * version per schema, so these shapes convert to JSON Schema correctly at runtime.
 */
export const mcpTools = tools as unknown as PluginTools;
