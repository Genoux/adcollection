import type { BrowseResponse, PickerItem } from "@/payload/admin/frameio-picker/types";
import { withFrameioSession } from "@/payload/frameio/session-route";
import {
  type ChildrenPage,
  listFolderChildren,
  listProjects,
  listVersionStackChildren,
} from "@/shared/lib/frameio/client";
import type { FrameioChild } from "@/shared/lib/frameio/types";

// Non-video files are dropped rather than shown disabled: an ad can only take a video.
const toItem = (child: FrameioChild): PickerItem | null => {
  if (child.type === "folder") return { id: child.id, kind: "folder", name: child.name };
  if (child.type === "version_stack") return { id: child.id, kind: "stack", name: child.name };
  if (!child.media_type?.startsWith("video/")) return null;

  const link = child.media_links?.thumbnail;
  return {
    id: child.id,
    kind: "video",
    name: child.name,
    ready: child.status === "transcoded",
    thumbnail: link?.url ?? link?.inline_url ?? link?.download_url ?? null,
  };
};

const toResponse = ({ children, next }: ChildrenPage): BrowseResponse => ({
  items: children.map(toItem).filter((item): item is PickerItem => item !== null),
  next,
});

export function GET(request: Request) {
  return withFrameioSession(request, async ({ auth }) => {
    const params = new URL(request.url).searchParams;
    const folder = params.get("folder");
    const stack = params.get("stack");
    const options = { after: params.get("after") ?? undefined, thumbnails: true };

    if (stack)
      return Response.json(toResponse(await listVersionStackChildren(auth, stack, options)));
    if (folder) return Response.json(toResponse(await listFolderChildren(auth, folder, options)));

    const projects = await listProjects(auth);
    return Response.json({
      items: projects.map((project) => ({
        id: project.root_folder_id,
        kind: "folder",
        name: project.name,
      })),
      next: null,
    } satisfies BrowseResponse);
  });
}
