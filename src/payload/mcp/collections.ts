export const mcpCollections = {
  // Creating an ad requires attaching two uploads, which the generic create tool
  // cannot do — importFrameioAd is the only creation path.
  ads: {
    description:
      "Short-form video ads with client, creator, tags and 1-10 ratings. Imported as drafts and published by a human.",
    enabled: { find: true, update: true, create: false, delete: false },
  },
  media: { enabled: { find: true } },
  clients: { enabled: { find: true } },
  "content-types": {
    description: "Content types, e.g. UGC, B-roll, Static.",
    enabled: { find: true },
  },
  industries: { enabled: { find: true } },
  niches: { enabled: { find: true } },
  angles: { description: "Creative angles, e.g. testimonial, unboxing.", enabled: { find: true } },
  platforms: { enabled: { find: true } },
  objectives: { enabled: { find: true } },
  markets: { enabled: { find: true } },
};
