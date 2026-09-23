import type { CollectionConfig } from "payload";
import { onlyLoggedIn } from "@/payload/access";

export const Media: CollectionConfig = {
  slug: "media",
  admin: { group: "System" },
  access: {
    // Anonymous reads here would enumerate every upload, including the videos of
    // unpublished draft ads, each with a directly playable R2 URL. The public site
    // is unaffected: its Local API calls default to overrideAccess: true and the
    // files themselves are served straight from the public R2 bucket.
    read: onlyLoggedIn,
    create: onlyLoggedIn,
    update: onlyLoggedIn,
    delete: onlyLoggedIn,
  },
  upload: {
    mimeTypes: ["image/*", "video/mp4", "video/webm", "video/quicktime"],
  },
  fields: [{ name: "alt", type: "text" }],
};
