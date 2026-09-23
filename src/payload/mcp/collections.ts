export const mcpCollections = {
  // Creating an ad requires attaching two uploads, which the generic create tool
  // cannot do — importFrameioAd is the only creation path.
  ads: {
    description:
      "Short-form video ads with brand, creator, classification and 1-10 ratings. Imported as drafts and published by a human.",
    enabled: { find: true, update: true, create: false, delete: false },
  },
  media: { enabled: { find: true } },
  platforms: { enabled: { find: true } },
  categories: { enabled: { find: true } },
  subcategories: { enabled: { find: true } },
  "content-types": { enabled: { find: true } },
};
