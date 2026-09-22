import type { PayloadRequest } from "payload";
import type { DownloadedAsset } from "@/shared/lib/frameio/renditions";

export async function createMedia(req: PayloadRequest, asset: DownloadedAsset, alt: string) {
  return req.payload.create({
    collection: "media",
    data: { alt },
    file: {
      data: asset.data,
      mimetype: asset.mimetype,
      name: asset.name,
      size: asset.data.byteLength,
    },
    overrideAccess: false,
    req,
  });
}

export async function deleteMedia(req: PayloadRequest, ids: (number | string)[]) {
  await Promise.all(
    ids.map((id) =>
      req.payload
        .delete({ collection: "media", id, overrideAccess: false, req })
        .catch((error) =>
          req.payload.logger.error({ err: error, id }, "[mcp] media cleanup failed"),
        ),
    ),
  );
}
