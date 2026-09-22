import type { CollectionConfig } from "payload";
import { onlyLoggedIn, publishedOrLoggedIn } from "@/payload/access";
import { applyOverallScore } from "@/payload/hooks/compute-overall-score";

const HIGHLIGHT_METRIC_OPTIONS = [
  { label: "Audience Grab", value: "audience-grab" },
  { label: "Watchability", value: "watchability" },
  { label: "Ad Clarity", value: "ad-clarity" },
] as const;

export const Ads: CollectionConfig = {
  slug: "ads",
  admin: { useAsTitle: "thumbnailTitle" },
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
              type: "text",
              required: true,
              admin: {
                description: "Name of the product/brand being promoted. Shown on tooltips.",
              },
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
          label: "Brand",
          fields: [
            { name: "companyName", type: "text" },
            { name: "companyWebsiteUrl", type: "text" },
            {
              name: "companyWebsiteDisplay",
              type: "text",
              admin: { description: "Shortened version of link" },
            },
            {
              name: "brandHandleName",
              type: "text",
              minLength: 5,
              maxLength: 25,
              admin: { description: "e.g. @dr.squatch" },
            },
            {
              name: "brandHandleUrl",
              type: "text",
              admin: {
                description: "If the brand has no social link, use Website as fallback",
              },
            },
            { name: "soundName", type: "text" },
            { name: "soundUrl", type: "text" },
          ],
        },
        {
          label: "Creator",
          fields: [
            { name: "profilePicture", type: "upload", relationTo: "media" },
            {
              name: "creatorHandle",
              type: "text",
              admin: { description: "Creator credits display" },
            },
            { name: "creatorProfileUrl", type: "text" },
          ],
        },
        {
          label: "Classification",
          fields: [
            { name: "platform", type: "relationship", relationTo: "platforms", required: true },
            { name: "category", type: "relationship", relationTo: "categories" },
            {
              name: "subcategories",
              type: "relationship",
              relationTo: "subcategories",
              hasMany: true,
            },
            {
              name: "contentTypes",
              type: "relationship",
              relationTo: "content-types",
              hasMany: true,
            },
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
  ],
  hooks: {
    beforeChange: [({ data, originalDoc }) => applyOverallScore({ data, originalDoc })],
  },
};
