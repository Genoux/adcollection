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
      adFilterSchema.parse({ industries: "beauty", platforms: "tiktok,instagram" }),
    );
    expect(where).toEqual({
      _status: { equals: "published" },
      "industry.slug": { in: ["beauty"] },
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

  it("adds in-filters for niches and markets", () => {
    const where = buildAdsWhere(adFilterSchema.parse({ niches: "skincare", markets: "us,ca" }));
    expect(where).toEqual({
      _status: { equals: "published" },
      "niches.slug": { in: ["skincare"] },
      "markets.slug": { in: ["us", "ca"] },
    });
  });

  it("matches a search word against ad text, credits and tag names", () => {
    const where = buildAdsWhere(adFilterSchema.parse({ search: "squatch" }));
    const paths = where.and?.[0]?.or?.map((condition) => Object.keys(condition)[0]);
    expect(paths).toEqual(
      expect.arrayContaining([
        "thumbnailTitle",
        "caption",
        "name",
        "creator.handle",
        "client.name",
        "niches.name",
        "markets.name",
      ]),
    );
    expect(where.and?.[0]?.or?.[0]).toEqual({ thumbnailTitle: { contains: "squatch" } });
  });

  it("requires every search word to match, ignoring leading @ and #", () => {
    const where = buildAdsWhere(adFilterSchema.parse({ search: "  @drsquatch  #skincare " }));
    const words = where.and?.map((clause) => clause.or?.[0]?.thumbnailTitle);
    expect(words).toEqual([{ contains: "drsquatch" }, { contains: "skincare" }]);
  });

  it("combines facets and search", () => {
    const where = buildAdsWhere(adFilterSchema.parse({ platforms: "tiktok", search: "dr" }));
    expect(where["platform.slug"]).toEqual({ in: ["tiktok"] });
    expect(where.and).toHaveLength(1);
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
