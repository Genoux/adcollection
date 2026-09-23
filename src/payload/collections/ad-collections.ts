import { randomBytes } from "node:crypto";
import type { CollectionConfig } from "payload";
import { onlyLoggedIn } from "@/payload/access";
import { revalidatePublicSite } from "@/payload/hooks/revalidate-public-site";

// The share link is the only thing gating a collection page, so it must not be
// guessable the way an incrementing id or a title slug would be.
const createShareId = () => randomBytes(9).toString("base64url");

export const AdCollections: CollectionConfig = {
  slug: "ad-collections",
  labels: { singular: "Collection", plural: "Collections" },
  typescript: { interface: "AdCollection" },
  admin: {
    useAsTitle: "title",
    group: "Library",
    defaultColumns: ["title", "updatedAt"],
  },
  access: {
    read: onlyLoggedIn,
    create: onlyLoggedIn,
    update: onlyLoggedIn,
    delete: onlyLoggedIn,
  },
  hooks: revalidatePublicSite,
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "description",
      type: "textarea",
      admin: { description: "Shown under the title on the shared page." },
    },
    {
      name: "ads",
      type: "relationship",
      relationTo: "ads",
      hasMany: true,
      admin: {
        components: { Field: "@/payload/admin/collection-builder/field#CollectionBuilderField" },
      },
    },
    {
      name: "shareId",
      type: "text",
      unique: true,
      index: true,
      admin: { hidden: true },
      hooks: {
        beforeChange: [
          ({ value, originalDoc }) => value || originalDoc?.shareId || createShareId(),
        ],
      },
    },
    {
      name: "share",
      type: "ui",
      admin: {
        position: "sidebar",
        components: { Field: "@/payload/admin/collection-share/field#CollectionShareField" },
      },
    },
  ],
};
