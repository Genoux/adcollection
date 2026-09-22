import { describe, expect, it } from "vitest";
import { adFilterSchema } from "../schemas";
import { buildAdBySlugWhere, buildAdsWhere } from "./build-ads-where";

describe("buildAdsWhere", () => {
  it("only requires published status for an empty filter", () => {
    const where = buildAdsWhere(adFilterSchema.parse({}));
    expect(where).toEqual({ _status: { equals: "published" } });
  });

  it("adds an in-filter per taxonomy facet", () => {
    const where = buildAdsWhere(
      adFilterSchema.parse({ categories: "beauty", platforms: "tiktok,instagram" }),
    );
    expect(where).toEqual({
      _status: { equals: "published" },
      "category.slug": { in: ["beauty"] },
      "platform.slug": { in: ["tiktok", "instagram"] },
    });
  });

  it("adds an in-filter for hasMany content types", () => {
    const where = buildAdsWhere(adFilterSchema.parse({ contentTypes: "unboxing" }));
    expect(where).toEqual({
      _status: { equals: "published" },
      "contentTypes.slug": { in: ["unboxing"] },
    });
  });

  it("adds in-filters for the client, industry and ad type facets", () => {
    const where = buildAdsWhere(
      adFilterSchema.parse({
        clients: "dr-squatch",
        industries: "beauty,fitness",
        adTypes: "ugc,testimonial",
      }),
    );
    expect(where).toEqual({
      _status: { equals: "published" },
      "client.slug": { in: ["dr-squatch"] },
      "industry.slug": { in: ["beauty", "fitness"] },
      "adTypes.slug": { in: ["ugc", "testimonial"] },
    });
  });

  it("ORs a case-insensitive contains search across title, caption and name", () => {
    const where = buildAdsWhere(adFilterSchema.parse({ search: "squatch" }));
    expect(where).toEqual({
      _status: { equals: "published" },
      or: [
        { thumbnailTitle: { contains: "squatch" } },
        { caption: { contains: "squatch" } },
        { name: { contains: "squatch" } },
      ],
    });
  });

  it("combines facets and search", () => {
    const where = buildAdsWhere(adFilterSchema.parse({ platforms: "tiktok", search: "dr" }));
    expect(where).toEqual({
      _status: { equals: "published" },
      "platform.slug": { in: ["tiktok"] },
      or: [
        { thumbnailTitle: { contains: "dr" } },
        { caption: { contains: "dr" } },
        { name: { contains: "dr" } },
      ],
    });
  });
});

describe("buildAdBySlugWhere", () => {
  it("requires published status so unpublished drafts stay off the public detail page", () => {
    expect(buildAdBySlugWhere("draft-ad")).toEqual({
      slug: { equals: "draft-ad" },
      _status: { equals: "published" },
    });
  });
});

describe("buildAdsWhere score sort", () => {
  it("excludes unrated ads so DESC NULLS FIRST cannot outrank real scores", () => {
    const where = buildAdsWhere(adFilterSchema.parse({ sort: "score" }));
    expect(where).toEqual({
      _status: { equals: "published" },
      overallScore: { exists: true },
    });
  });

  it("keeps unrated ads for the default newest sort", () => {
    const where = buildAdsWhere(adFilterSchema.parse({ sort: "newest" }));
    expect(where.overallScore).toBeUndefined();
  });
});
