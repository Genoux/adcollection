import type { CollectionConfig } from "payload";
import { anyoneCanRead, onlyLoggedIn } from "@/payload/access";
import { revalidatePublicSite } from "@/payload/hooks/revalidate-public-site";

function tagCollection(slug: string, singular: string, plural: string): CollectionConfig {
  return {
    slug,
    labels: { singular, plural },
    // Payload singularizes the slug for the type name, which turns "niches" into "Nich".
    typescript: { interface: singular.replaceAll(" ", "") },
    admin: { useAsTitle: "name", group: "Tags", defaultColumns: ["name", "slug"] },
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
      { name: "description", type: "text" },
    ],
  };
}

export const ContentTypes = tagCollection("content-types", "Content Type", "Content Types");
export const Industries = tagCollection("industries", "Industry", "Industries");
export const Niches = tagCollection("niches", "Niche", "Niches");
export const Angles = tagCollection("angles", "Angle", "Angles");
export const Platforms = tagCollection("platforms", "Platform", "Platforms");
export const Objectives = tagCollection("objectives", "Objective", "Objectives");
export const Markets = tagCollection("markets", "Market", "Markets");
