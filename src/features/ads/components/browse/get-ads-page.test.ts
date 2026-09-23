import { beforeEach, describe, expect, it, vi } from "vitest";

const { getPublishedAds } = vi.hoisted(() => ({ getPublishedAds: vi.fn() }));

vi.mock("@/features/ads/queries/get-published-ads", () => ({ getPublishedAds }));

import { getAdsPage } from "./get-ads-page";

describe("getAdsPage", () => {
  beforeEach(() => {
    getPublishedAds.mockReset();
    getPublishedAds.mockResolvedValue({ items: [], nextCursor: null });
  });

  it("rejects an oversized limit instead of hydrating the whole table", async () => {
    await expect(getAdsPage({ limit: 5_000_000 })).rejects.toThrow();
    expect(getPublishedAds).not.toHaveBeenCalled();
  });

  it("rejects an unknown sort value", async () => {
    await expect(getAdsPage({ sort: "trending" })).rejects.toThrow();
    expect(getPublishedAds).not.toHaveBeenCalled();
  });

  it("passes a parsed filter with defaults to the query", async () => {
    await getAdsPage({ platforms: "tiktok" });
    expect(getPublishedAds).toHaveBeenCalledWith({
      contentTypes: [],
      industries: [],
      angles: [],
      platforms: ["tiktok"],
      objectives: [],
      search: "",
      sort: "newest",
      limit: 24,
    });
  });
});
