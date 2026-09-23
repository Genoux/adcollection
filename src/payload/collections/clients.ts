import type { CollectionConfig } from "payload";
import { anyoneCanRead, onlyLoggedIn } from "@/payload/access";
import { revalidatePublicSite } from "@/payload/hooks/revalidate-public-site";

export const Clients: CollectionConfig = {
  slug: "clients",
  admin: { useAsTitle: "name", group: "Library", defaultColumns: ["name", "handle", "websiteUrl"] },
  access: {
    read: anyoneCanRead,
    create: onlyLoggedIn,
    update: onlyLoggedIn,
    delete: onlyLoggedIn,
  },
  hooks: revalidatePublicSite,
  fields: [
    { name: "name", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "logo", type: "upload", relationTo: "media" },
    { name: "handle", type: "text", admin: { description: "Social handle, e.g. drsquatch" } },
    {
      name: "handleUrl",
      type: "text",
      admin: { description: "If the client has no social link, use the website as fallback." },
    },
    { name: "websiteUrl", type: "text" },
    {
      name: "websiteDisplay",
      type: "text",
      admin: { description: "Shortened version of the website link." },
    },
  ],
};
