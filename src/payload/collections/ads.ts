import type { CollectionConfig } from "payload";
import { onlyLoggedIn, publishedOrLoggedIn } from "@/payload/access";
import { applyOverallScore } from "@/payload/hooks/compute-overall-score";
import { LANGUAGE_OPTIONS, PRODUCT_TYPE_OPTIONS } from "@/payload/tag-options";

const HIGHLIGHT_METRIC_OPTIONS = [
  { label: "Audience Grab", value: "audience-grab" },
  { label: "Watchability", value: "watchability" },
  { label: "Ad Clarity", value: "ad-clarity" },
] as const;

export const Ads: CollectionConfig = {
  slug: "ads",
  admin: { useAsTitle: "thumbnailTitle", group: "Library" },
  versions: { drafts: true },
  access: {
    read: publishedOrLoggedIn,
    create: onlyLoggedIn,
    update: onlyLoggedIn,
    delete: onlyLoggedIn,
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Details",
          fields: [
            {
              name: "thumbnailTitle",
              type: "text",
              required: true,
              maxLength: 60,
              admin: {
                description: "Display version of the caption. Remove @handles, #hashtags, emojis.",
              },
            },
            {
              name: "name",
              label: "Product",
              type: "text",
              required: true,
              admin: { description: "Product being promoted. Shown on tooltips." },
            },
            { name: "slug", type: "text", required: true, unique: true, index: true },
            {
              name: "caption",
              type: "text",
              minLength: 8,
              maxLength: 100,
            },
          ],
        },
        {
          label: "Media",
          fields: [
            {
              name: "video",
              type: "upload",
              relationTo: "media",
              required: true,
              admin: {
                components: {
                  afterInput: [
                    {
                      path: "@/payload/admin/frameio-picker/field#FrameioPickerField",
                      clientProps: { thumbnailPath: "thumbnail" },
                    },
                  ],
                },
              },
            },
            { name: "thumbnail", type: "upload", relationTo: "media", required: true },
            {
              name: "madeWithInbeat",
              type: "checkbox",
              defaultValue: false,
              admin: { description: "Was this ad made using inBeat or by inBeat Agency?" },
            },
            {
              name: "originalUrl",
              type: "text",
              admin: { description: "Link to the original ad (if not made with inBeat)" },
            },
          ],
        },
        {
          label: "Credits",
          fields: [
            { name: "client", type: "relationship", relationTo: "clients", required: true },
            {
              name: "creator",
              type: "group",
              fields: [
                { name: "handle", type: "text", admin: { description: "Without the @." } },
                { name: "profileUrl", type: "text" },
              ],
            },
            { name: "soundName", type: "text" },
            { name: "soundUrl", type: "text" },
          ],
        },
        {
          label: "Tags",
          fields: [
            {
              name: "contentTypes",
              type: "relationship",
              relationTo: "content-types",
              hasMany: true,
              required: true,
            },
            { name: "industry", type: "relationship", relationTo: "industries" },
            { name: "niches", type: "relationship", relationTo: "niches", hasMany: true },
            { name: "angles", type: "relationship", relationTo: "angles", hasMany: true },
            {
              name: "platform",
              type: "relationship",
              relationTo: "platforms",
              required: true,
              admin: { description: "Platform the ad was made for. Part of the ad URL." },
            },
            { name: "objective", type: "relationship", relationTo: "objectives" },
            { name: "markets", type: "relationship", relationTo: "markets", hasMany: true },
            { name: "languages", type: "select", hasMany: true, options: [...LANGUAGE_OPTIONS] },
            { name: "productType", type: "select", options: [...PRODUCT_TYPE_OPTIONS] },
          ],
        },
        {
          label: "Rating",
          fields: [
            { name: "ratingAudienceGrab", type: "number", min: 1, max: 10 },
            { name: "ratingWatchability", type: "number", min: 1, max: 10 },
            { name: "ratingClarity", type: "number", min: 1, max: 10 },
            {
              name: "overallScore",
              type: "number",
              admin: { readOnly: true },
            },
            {
              name: "highlight",
              type: "textarea",
              maxLength: 290,
              admin: { description: "A short statement about the strongest metric." },
            },
            { name: "highlightMetric", type: "select", options: [...HIGHLIGHT_METRIC_OPTIONS] },
          ],
        },
      ],
    },
    { name: "featured", type: "checkbox", defaultValue: false, admin: { position: "sidebar" } },
    {
      name: "topPerformer",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar", description: "Performed notably well for the client." },
    },
  ],
  hooks: {
    beforeChange: [({ data, originalDoc }) => applyOverallScore({ data, originalDoc })],
  },
};
