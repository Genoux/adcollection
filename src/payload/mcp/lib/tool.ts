import type { PayloadRequest } from "payload";
import type { z } from "zod";

export type McpToolResult = {
  content: { text: string; type: "text" }[];
};

/**
 * Mirrors the plugin's custom-tool shape without importing its types. The plugin is
 * built against zod 3 while this project is on zod 4, so its `ZodRawShape` cannot
 * describe these schemas — the MCP SDK the plugin registers into accepts either
 * version at runtime, as long as a single shape does not mix the two.
 */
export type McpTool = {
  description: string;
  handler: (
    args: Record<string, unknown>,
    req: PayloadRequest,
    extra: unknown,
  ) => McpToolResult | Promise<McpToolResult>;
  name: string;
  parameters: Record<string, z.ZodType>;
};

export const text = (body: string): McpToolResult => ({
  content: [{ type: "text", text: body }],
});
