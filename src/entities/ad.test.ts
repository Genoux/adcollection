import { describe, expect, it } from "vitest";
import type {
  Ad,
  Angle,
  Client,
  ContentType,
  Industry,
  Media,
  Niche,
  Platform,
} from "@/payload-types";
import { toAdDetail, toAdListItem } from "./ad";

const tag = { createdAt: "", updatedAt: "" };

const platform: Platform = { id: 1, name: "TikTok", slug: "tiktok", ...tag };
const industry: Industry = { id: 2, name: "Beauty", slug: "beauty", ...tag };
const angle: Angle = { id: 3, name: "Unboxing", slug: "unboxing", ...tag };
const niche: Niche = { id: 4, name: "Skincare", slug: "skincare", ...tag };
const ugc: ContentType = { id: 7, name: "UGC", slug: "ugc", ...tag };

const client: Client = {
  id: 5,
  name: "Dr. Squatch",
  slug: "dr-squatch",
  logo: null,
  websiteUrl: "https://www.drsquatch.com",
  websiteDisplay: "drsquatch.com",
  handle: "@drsquatch",
  handleUrl: "https://tiktok.com/@drsquatch",
  ...tag,
};

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
    name: "Pine Tar Soap",
    slug: "dr-squatch-soap",
    caption: null,
    video: media(20, "https://cdn.example.com/video.mp4"),
    thumbnail: media(21, "https://cdn.example.com/thumb.jpg"),
    madeWithInbeat: false,
    originalUrl: null,
    client,
    creator: {},
    soundName: null,
    soundUrl: null,
    contentTypes: [ugc],
    industry: null,
    niches: null,
    angles: null,
    platform,
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
  it("maps required media urls, the platform and the content types", () => {
    const item = toAdListItem(makeAd());
    expect(item).toMatchObject({
      id: 10,
      slug: "dr-squatch-soap",
      thumbnailTitle: "Dr Squatch Soap",
      thumbnailUrl: "https://cdn.example.com/thumb.jpg",
      videoUrl: "https://cdn.example.com/video.mp4",
      platform: { id: 1, name: "TikTok", slug: "tiktok" },
      client: { id: 5, name: "Dr. Squatch", slug: "dr-squatch" },
      industry: null,
      contentTypes: [{ id: 7, name: "UGC", slug: "ugc" }],
      angles: [],
    });
  });

  it("maps a populated industry and angles list", () => {
    const item = toAdListItem(makeAd({ industry, angles: [angle] }));
    expect(item?.industry).toEqual({ id: 2, name: "Beauty", slug: "beauty" });
    expect(item?.angles).toEqual([{ id: 3, name: "Unboxing", slug: "unboxing" }]);
  });

  it("throws when a relationship was not populated (missing depth)", () => {
    expect(() => toAdListItem(makeAd({ platform: 1 }))).toThrow(/depth/);
  });
});

describe("toAdDetail", () => {
  it("maps the client profile with its logo, and niches", () => {
    const detail = toAdDetail(
      makeAd({
        client: { ...client, logo: media(23, "https://cdn.example.com/logo.jpg") },
        niches: [niche],
        madeWithInbeat: true,
      }),
    );
    expect(detail?.client).toMatchObject({
      name: "Dr. Squatch",
      logoUrl: "https://cdn.example.com/logo.jpg",
      websiteDisplay: "drsquatch.com",
    });
    expect(detail?.niches).toEqual([{ id: 4, name: "Skincare", slug: "skincare" }]);
    expect(detail?.madeWithInbeat).toBe(true);
  });

  it("defaults a missing logo and creator to null", () => {
    const detail = toAdDetail(makeAd());
    expect(detail?.client?.logoUrl).toBeNull();
    expect(detail?.creator).toBeNull();
  });

  it("throws when the client logo was not populated (detail needs depth 2)", () => {
    expect(() => toAdDetail(makeAd({ client: { ...client, logo: 23 } }))).toThrow(/depth/);
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
    expect(() => toAdDetail(makeAd({ angles: [3] }))).toThrow(/depth/);
  });

  it("skips a deleted optional taxonomy row rather than failing the whole ad", () => {
    const item = toAdListItem(makeAd({ industry: null, angles: [null as unknown as Angle] }));
    expect(item?.angles).toEqual([]);
    expect(item?.industry).toBeNull();
  });

  it("returns null from toAdDetail when the list item cannot be rendered", () => {
    expect(toAdDetail(makeAd({ video: null as unknown as Media }))).toBeNull();
  });

  it("renders handles without a duplicate @ when the source already includes one", () => {
    const detail = toAdDetail(makeAd({ creator: { handle: "@taraswrld", profileUrl: null } }));

    expect(detail?.client?.handle).toBe("drsquatch");
    expect(detail?.creator?.handle).toBe("taraswrld");
  });

  it("leaves handles without a leading @ untouched", () => {
    const detail = toAdDetail(makeAd({ client: { ...client, handle: "scentbird" } }));

    expect(detail?.client?.handle).toBe("scentbird");
  });

  it("keeps the ad renderable when its client was deleted", () => {
    const item = toAdListItem(makeAd({ client: null as unknown as Client }));
    expect(item?.client).toBeNull();
  });
});
