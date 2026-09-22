import type { CollectionConfig } from "payload";
import { anyoneCanRead, onlyLoggedIn } from "@/payload/access";

export const AdTypes: CollectionConfig = {
  slug: "ad-types",
  admin: { useAsTitle: "name" },
  access: {
    read: anyoneCanRead,
    create: onlyLoggedIn,
    update: onlyLoggedIn,
    delete: onlyLoggedIn,
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "description", type: "text" },
  ],
};
