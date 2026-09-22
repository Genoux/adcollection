import { z } from "zod";
import { type McpTool, text } from "@/payload/mcp/lib/tool";
import { FOLDER_PAGE_SIZE, listFolderChildren, listProjects } from "@/shared/lib/frameio/client";
import { formatBytes } from "@/shared/lib/frameio/renditions";

export const frameioBrowse: McpTool = {
  name: "frameioBrowse",
  description:
    "Browse Frame.io. Called with no arguments it lists every project and its root folder id; called with a folderId it lists that folder's contents. Use it to find the file id of a video before calling importFrameioAd.",
  parameters: {
    folderId: z
      .string()
      .optional()
      .describe(
        "Id of the folder to list, taken from a project's rootFolderId or a nested folder id. Omit to list projects.",
      ),
  },
  handler: async (args) => {
    const { folderId } = args as { folderId?: string };

    if (!folderId) {
      const projects = await listProjects();
      if (projects.length === 0) return text("no projects in this Frame.io account.");

      return text(
        projects
          .map((p) => `${p.name} — rootFolderId ${p.root_folder_id} (${p.status})`)
          .join("\n"),
      );
    }

    const { children, hasMore } = await listFolderChildren(folderId);
    if (children.length === 0) return text("this folder is empty.");

    const lines = children.map((child) => {
      if (child.type === "folder") return `[folder] ${child.name} — id ${child.id}`;
      if (child.type === "version_stack") return `[version stack] ${child.name} — id ${child.id}`;

      const ready = child.status === "transcoded" ? "ready" : `not ready (${child.status})`;
      return `[file] ${child.name} — id ${child.id}, ${child.media_type ?? "unknown type"}, ${formatBytes(child.file_size)} original, ${ready}`;
    });

    if (hasMore) {
      lines.push(
        `…showing the ${FOLDER_PAGE_SIZE} most recent items only; this folder has more. Narrow the search in Frame.io or browse a subfolder.`,
      );
    }

    return text(lines.join("\n"));
  },
};
