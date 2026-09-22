import { createLocalReq } from "payload";
import { z } from "zod";
import type { ImportResponse } from "@/payload/admin/frameio-picker/types";
import { importFrameioVideo } from "@/payload/frameio/import-video";
import { withFrameioSession } from "@/payload/frameio/session-route";

// Downloading a web rendition up to FRAMEIO_MAX_VIDEO_MB and re-uploading it to R2
// outlasts the default function timeout; matches the MCP endpoint's budget.
export const maxDuration = 300;

const body = z.object({ fileId: z.string().min(1) });

export function POST(request: Request) {
  return withFrameioSession(request, async ({ auth, payload, user }) => {
    const parsed = body.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return Response.json({ error: "fileId is required." }, { status: 400 });

    const req = await createLocalReq({ user }, payload);
    const { thumbnail, video } = await importFrameioVideo(req, auth, parsed.data.fileId);

    return Response.json({ thumbnail: thumbnail.id, video: video.id } satisfies ImportResponse);
  });
}
