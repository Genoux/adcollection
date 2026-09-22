import { z } from "zod";
import { type McpTool, text } from "@/payload/mcp/lib/tool";
import { getFile } from "@/shared/lib/frameio/client";
import { maxVideoBytes } from "@/shared/lib/frameio/config";
import { formatBytes, resolveRenditions } from "@/shared/lib/frameio/renditions";

export const frameioInspectFile: McpTool = {
  name: "frameioInspectFile",
  description:
    "Show a Frame.io file's metadata and the size of every rendition available for import, flagging which ones fit under the web size limit. Use this to confirm a file is importable before calling importFrameioAd.",
  parameters: {
    fileId: z.string().describe("Frame.io file id, from frameioBrowse."),
  },
  handler: async (args) => {
    const { fileId } = args as { fileId: string };
    const file = await getFile(fileId);
    const limit = maxVideoBytes();

    const candidates = await resolveRenditions(file, [
      "efficient",
      "high_quality",
      "original",
      "thumbnail_high_quality",
      "thumbnail",
    ]);

    const renditions =
      candidates.length === 0
        ? "  none available yet"
        : candidates
            .map(({ bytes, rendition }) => {
              if (bytes === null) return `  ${rendition}: size unknown (streamed)`;
              return `  ${rendition}: ${formatBytes(bytes)}${bytes > limit ? " — OVER LIMIT" : ""}`;
            })
            .join("\n");

    return text(
      [
        `name: ${file.name}`,
        `id: ${file.id}`,
        `type: ${file.media_type ?? "unknown"}`,
        `status: ${file.status}`,
        `original size: ${formatBytes(file.file_size)}`,
        `uploaded by: ${file.creator?.name ?? "unknown"}`,
        `frame.io url: ${file.view_url}`,
        `web size limit: ${formatBytes(limit)}`,
        "renditions:",
        renditions,
      ].join("\n"),
    );
  },
};
