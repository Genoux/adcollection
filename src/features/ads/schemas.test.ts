import { describe, expect, it } from "vitest";
import { adFilterSchema, parseAdFilter } from "./schemas";

describe("adFilterSchema", () => {
  it("applies defaults for an empty filter", () => {
    const result = adFilterSchema.parse({});

    expect(result).toEqual({
      adTypes: [],
      categories: [],
      clients: [],
      contentTypes: [],
      industries: [],
      platforms: [],
      search: "",
      sort: "newest",
      limit: 24,
    });
  });

  it("parses a comma-separated facet value (URL search params)", () => {
    const result = adFilterSchema.parse({ categories: "beauty,fashion, tech" });
    expect(result.categories).toEqual(["beauty", "fashion", "tech"]);
  });

  it("parses a real array facet value (client calls)", () => {
    const result = adFilterSchema.parse({ contentTypes: ["unboxing", "review"] });
    expect(result.contentTypes).toEqual(["unboxing", "review"]);
  });

  it("rejects an invalid sort value", () => {
    const result = adFilterSchema.safeParse({ sort: "trending" });
    expect(result.success).toBe(false);
  });

  it("coerces a string limit from URL search params", () => {
    const result = adFilterSchema.parse({ limit: "50" });
    expect(result.limit).toBe(50);
  });
});

describe("adFilterSchema cursor", () => {
  it("coerces a numeric cursor from URL search params", () => {
    expect(adFilterSchema.parse({ cursor: "3" }).cursor).toBe(3);
  });

  it("rejects a non-numeric cursor", () => {
    expect(adFilterSchema.safeParse({ cursor: "abc" }).success).toBe(false);
  });

  it("rejects a negative cursor that would become a negative OFFSET", () => {
    expect(adFilterSchema.safeParse({ cursor: "-3" }).success).toBe(false);
  });
});

describe("parseAdFilter", () => {
  it("falls back to defaults instead of throwing on a malformed query string", () => {
    expect(parseAdFilter({ limit: "abc", sort: "trending", cursor: "-3" })).toEqual(
      adFilterSchema.parse({}),
    );
  });

  it("keeps a valid query string", () => {
    expect(parseAdFilter({ sort: "score", limit: "12" })).toMatchObject({
      sort: "score",
      limit: 12,
    });
  });
});
