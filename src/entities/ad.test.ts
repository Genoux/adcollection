import { describe, expect, it } from "vitest";
import type {
  Ad,
  AdType,
  Category,
  Client,
  ContentType,
  Industry,
  Media,
  Platform,
  Subcategory,
} from "@/payload-types";
import { toAdDetail, toAdListItem } from "./ad";

const platform: Platform = {
  id: 1,
  name: "TikTok",
  slug: "tiktok",
  createdAt: "",
  updatedAt: "",
};

const category: Category = { id: 2, name: "Beauty", slug: "beauty", createdAt: "", updatedAt: "" };

const contentType: ContentType = {
  id: 3,
  name: "Unboxing",
  slug: "unboxing",
  createdAt: "",
  updatedAt: "",
};

const subcategory: Subcategory = {
  id: 4,
  name: "Skincare",
  slug: "skincare",
  createdAt: "",
  updatedAt: "",
};

const client: Client = {
  id: 5,
  name: "Dr Squatch",
  slug: "dr-squatch",
  createdAt: "",
  updatedAt: "",
};

const industry: Industry = {
  id: 6,
  name: "Personal Care",
  slug: "personal-care",
  createdAt: "",
  updatedAt: "",
};

const adType: AdType = { id: 7, name: "UGC", slug: "ugc", createdAt: "", updatedAt: "" };

const media = (id: number, url: string): Media => ({
  id,
  url,
  createdAt: "",
  updatedAt: "",
});

function makeAd(overrides: Partial<Ad> = {}): Ad {
  return {
    id: 10,
    thumbnailTitle: "Dr Squatch Soap",
    name: "Dr Squatch",
    slug: "dr-squatch-soap",
    caption: null,
    video: media(20, "https://cdn.example.com/video.mp4"),
    thumbnail: media(21, "https://cdn.example.com/thumb.jpg"),
    madeWithInbeat: false,
    originalUrl: null,
    companyName: null,
    companyWebsiteUrl: null,
    companyWebsiteDisplay: null,
    brandHandleName: null,
    brandHandleUrl: null,
    soundName: null,
    soundUrl: null,
    profilePicture: null,
    creatorHandle: null,
    creatorProfileUrl: null,
    platform,
    client: null,
    industry: null,
    category: null,
    subcategories: null,
    contentTypes: null,
    adTypes: null,
    ratingAudienceGrab: null,
    ratingWatchability: null,
    ratingClarity: null,
    overallScore: null,
    highlight: null,
    highlightMetric: null,
    featured: false,
    updatedAt: "",
    createdAt: "2024-01-01T00:00:00.000Z",
    _status: "published",
    ...overrides,
  };
}

describe("toAdListItem", () => {
  it("maps required media urls and the platform reference", () => {
    const item = toAdListItem(makeAd());
    expect(item).toMatchObject({
      id: 10,
      slug: "dr-squatch-soap",
      thumbnailTitle: "Dr Squatch Soap",
      thumbnailUrl: "https://cdn.example.com/thumb.jpg",
      videoUrl: "https://cdn.example.com/video.mp4",
      platform: { id: 1, name: "TikTok", slug: "tiktok" },
      category: null,
      contentTypes: [],
    });
  });

  it("maps a populated category and contentTypes list", () => {
    const item = toAdListItem(makeAd({ category, contentTypes: [contentType] }));
    expect(item?.category).toEqual({ id: 2, name: "Beauty", slug: "beauty" });
    expect(item?.contentTypes).toEqual([{ id: 3, name: "Unboxing", slug: "unboxing" }]);
  });

  it("throws when a relationship was not populated (missing depth)", () => {
    expect(() => toAdListItem(makeAd({ platform: 1 }))).toThrow(/depth/);
  });
});

describe("toAdDetail", () => {
  it("maps optional profilePicture url and subcategories", () => {
    const detail = toAdDetail(
      makeAd({
        profilePicture: media(23, "https://cdn.example.com/avatar.jpg"),
        subcategories: [subcategory],
        madeWithInbeat: true,
      }),
    );
    expect(detail?.profilePictureUrl).toBe("https://cdn.example.com/avatar.jpg");
    expect(detail?.subcategories).toEqual([{ id: 4, name: "Skincare", slug: "skincare" }]);
    expect(detail?.madeWithInbeat).toBe(true);
  });

  it("defaults optional media urls to null", () => {
    const detail = toAdDetail(makeAd());
    expect(detail?.profilePictureUrl).toBeNull();
  });

  it("maps the client, industry and ad type tags", () => {
    const detail = toAdDetail(makeAd({ client, industry, adTypes: [adType] }));
    expect(detail?.client).toEqual({ id: 5, name: "Dr Squatch", slug: "dr-squatch" });
    expect(detail?.industry).toEqual({ id: 6, name: "Personal Care", slug: "personal-care" });
    expect(detail?.adTypes).toEqual([{ id: 7, name: "UGC", slug: "ugc" }]);
  });

  it("leaves untagged ads with empty client, industry and ad types", () => {
    const detail = toAdDetail(makeAd());
    expect(detail?.client).toBeNull();
    expect(detail?.industry).toBeNull();
    expect(detail?.adTypes).toEqual([]);
  });
});

describe("broken relationships", () => {
  it("returns null instead of throwing when a required media doc was deleted", () => {
    expect(toAdListItem(makeAd({ thumbnail: null as unknown as Media }))).toBeNull();
    expect(toAdListItem(makeAd({ video: null as unknown as Media }))).toBeNull();
    expect(toAdListItem(makeAd({ platform: null as unknown as Platform }))).toBeNull();
  });

  it("still throws on an unpopulated id, which is a depth bug rather than missing data", () => {
    expect(() => toAdListItem(makeAd({ thumbnail: 21 }))).toThrow(/depth/);
    expect(() => toAdDetail(makeAd({ contentTypes: [3] }))).toThrow(/depth/);
    expect(() => toAdDetail(makeAd({ client: 5 }))).toThrow(/depth/);
  });

  it("skips a deleted optional taxonomy row rather than failing the whole ad", () => {
    const item = toAdListItem(
      makeAd({ category: null, contentTypes: [null as unknown as ContentType] }),
    );
    expect(item?.contentTypes).toEqual([]);
    expect(item?.category).toBeNull();
  });

  it("returns null from toAdDetail when the list item cannot be rendered", () => {
    expect(toAdDetail(makeAd({ video: null as unknown as Media }))).toBeNull();
  });

  it("renders handles without a duplicate @ when the source already includes one", () => {
    const detail = toAdDetail(
      makeAd({ brandHandleName: "@icelandicprovisions", creatorHandle: "@taraswrld" }),
    );

    expect(detail?.brandHandleName).toBe("icelandicprovisions");
    expect(detail?.creatorHandle).toBe("taraswrld");
  });

  it("leaves handles without a leading @ untouched", () => {
    const detail = toAdDetail(makeAd({ brandHandleName: "scentbird", creatorHandle: null }));

    expect(detail?.brandHandleName).toBe("scentbird");
    expect(detail?.creatorHandle).toBeNull();
  });
});
