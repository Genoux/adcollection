import { FrameioError } from "@/shared/lib/frameio/errors";
import type { FrameioFile, FrameioRendition } from "@/shared/lib/frameio/types";

/**
 * Preference order, not quality order. `efficient` is Frame.io's web-delivery h264
 * transcode and is what we actually want on the site; `original` is last because a
 * ProRes or HEVC master plays badly (or not at all) in a browser even when it is
 * small enough to pass the size cap.
 */
const VIDEO_LADDER: FrameioRendition[] = ["efficient", "high_quality", "original"];
const POSTER_LADDER: FrameioRendition[] = ["thumbnail_high_quality", "thumbnail"];

const MAX_POSTER_BYTES = 10 * 1024 * 1024;

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
};

export const formatBytes = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(1)}MB`;

export type RenditionCandidate = {
  bytes: null | number;
  rendition: FrameioRendition;
  url: string;
};

export type DownloadedAsset = {
  data: Buffer;
  mimetype: string;
  name: string;
  rendition: FrameioRendition;
};

function renditionUrl(file: FrameioFile, rendition: FrameioRendition): null | string {
  const link = file.media_links?.[rendition];
  return link?.download_url ?? link?.url ?? link?.inline_url ?? null;
}

/**
 * Frame.io documents that watermarked and download-restricted renditions are streamed
 * without a Content-Length, so an absent size is normal rather than an error. Those
 * candidates stay in the running and get enforced by the byte limit during download.
 */
async function probeSize(url: string): Promise<null | number> {
  try {
    const response = await fetch(url, { method: "HEAD" });
    if (!response.ok) return null;
    const length = response.headers.get("content-length");
    return length === null ? null : Number(length);
  } catch {
    return null;
  }
}

/**
 * Candidates arrive in ladder order, so the first fit is also the most preferred.
 * An unknown size is treated as a fit because Frame.io omits Content-Length on
 * watermarked and streamed renditions; the download itself enforces the cap.
 */
export const pickRendition = (candidates: RenditionCandidate[], maxBytes: number) =>
  candidates.find(({ bytes }) => bytes === null || bytes <= maxBytes) ?? null;

export async function resolveRenditions(
  file: FrameioFile,
  ladder: FrameioRendition[],
): Promise<RenditionCandidate[]> {
  const available = ladder
    .map((rendition) => ({ rendition, url: renditionUrl(file, rendition) }))
    .filter((candidate): candidate is { rendition: FrameioRendition; url: string } =>
      Boolean(candidate.url),
    );

  return Promise.all(
    available.map(async (candidate) => ({ ...candidate, bytes: await probeSize(candidate.url) })),
  );
}

/**
 * The extension has to come from the served content type rather than the Frame.io
 * filename, because a transcode of `master.mov` is an mp4 and Payload derives the
 * stored object's type from the name we give it.
 */
function buildFilename(file: FrameioFile, mimetype: string, suffix?: string) {
  const extension = EXTENSION_BY_MIME[mimetype];

  if (!extension) {
    throw new FrameioError(
      `"${file.name}" was served as "${mimetype || "an unknown type"}", which the site cannot play. Use a file with an mp4, webm or mov rendition.`,
    );
  }

  const stem = file.name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `${stem || file.id}${suffix ? `-${suffix}` : ""}.${extension}`;
}

/**
 * Aborts mid-stream once the cap is exceeded so an unexpectedly large or
 * Content-Length-less rendition cannot exhaust the function's heap.
 */
async function downloadCapped(url: string, maxBytes: number): Promise<[Buffer, string]> {
  const controller = new AbortController();
  const response = await fetch(url, { signal: controller.signal });

  if (!response.ok || !response.body) {
    throw new FrameioError(`rendition download failed: ${response.status}`, response.status);
  }

  const chunks: Uint8Array[] = [];
  let received = 0;

  for await (const chunk of response.body as unknown as AsyncIterable<Uint8Array>) {
    received += chunk.byteLength;
    if (received > maxBytes) {
      controller.abort();
      throw new FrameioError(`rendition exceeded the ${formatBytes(maxBytes)} limit mid-download`);
    }
    chunks.push(chunk);
  }

  const mimetype = response.headers.get("content-type")?.split(";")[0]?.trim() ?? "";
  return [Buffer.concat(chunks), mimetype];
}

async function downloadBestFit(
  file: FrameioFile,
  ladder: FrameioRendition[],
  maxBytes: number,
  suffix?: string,
): Promise<DownloadedAsset> {
  const candidates = await resolveRenditions(file, ladder);

  if (candidates.length === 0) {
    throw new FrameioError(
      `"${file.name}" has no usable rendition (status "${file.status}"). Files must finish transcoding before import.`,
    );
  }

  const fit = pickRendition(candidates, maxBytes);

  if (!fit) {
    const sizes = candidates
      .map((c) => `${c.rendition} ${c.bytes === null ? "unknown" : formatBytes(c.bytes)}`)
      .join(", ");
    throw new FrameioError(
      `every rendition of "${file.name}" is over the ${formatBytes(maxBytes)} web limit (${sizes}). Re-export a smaller master or raise FRAMEIO_MAX_VIDEO_MB.`,
    );
  }

  const [data, mimetype] = await downloadCapped(fit.url, maxBytes);

  return {
    data,
    mimetype,
    name: buildFilename(file, mimetype, suffix),
    rendition: fit.rendition,
  };
}

export const downloadVideo = (file: FrameioFile, maxBytes: number) =>
  downloadBestFit(file, VIDEO_LADDER, maxBytes);

export const downloadPoster = (file: FrameioFile) =>
  downloadBestFit(file, POSTER_LADDER, MAX_POSTER_BYTES, "poster");
