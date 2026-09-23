import type { PayloadRequest } from "payload";
import { createMedia, deleteMedia } from "@/payload/frameio/media";
import { type FrameioAuth, getFile } from "@/shared/lib/frameio/client";
import { maxVideoBytes } from "@/shared/lib/frameio/config";
import { FrameioError } from "@/shared/lib/frameio/errors";
import { downloadPoster, downloadVideo } from "@/shared/lib/frameio/renditions";

const stem = (name: string) => name.replace(/\.[^.]+$/, "");

/**
 * Creates the video and its poster frame in Media. Callers that go on to create
 * something referencing them own cleanup via `deleteMedia` if that step fails.
 */
export async function importFrameioVideo(
  req: PayloadRequest,
  auth: FrameioAuth,
  fileId: string,
  alt?: string,
) {
  const file = await getFile(auth, fileId);

  if (!file.media_type?.startsWith("video/")) {
    throw new FrameioError(
      `"${file.name}" is ${file.media_type ?? "an unknown type"}, not a video.`,
    );
  }
  if (file.status !== "transcoded") {
    throw new FrameioError(
      `"${file.name}" is still "${file.status}". Frame.io only exposes web renditions once transcoding finishes — try again shortly.`,
    );
  }

  const label = alt ?? stem(file.name);

  // Sequential so only one asset buffer is live at a time; both are held in memory
  // by Payload's upload pipeline and the video can be up to FRAMEIO_MAX_VIDEO_MB.
  const videoAsset = await downloadVideo(file, maxVideoBytes());
  const video = await createMedia(req, videoAsset, label);

  try {
    const posterAsset = await downloadPoster(file);
    const thumbnail = await createMedia(req, posterAsset, `${label} poster`);
    return { file, posterAsset, thumbnail, video, videoAsset };
  } catch (error) {
    await deleteMedia(req, [video.id]);
    throw error;
  }
}
