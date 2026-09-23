import { describe, expect, it } from "vitest";
import { formatBytes, pickRendition, type RenditionCandidate } from "./renditions";

const MB = 1024 * 1024;

const candidate = (
  rendition: RenditionCandidate["rendition"],
  bytes: null | number,
): RenditionCandidate => ({ bytes, rendition, url: `https://frame.io/${rendition}` });

describe("pickRendition", () => {
  const limit = 100 * MB;

  it("takes the most preferred rendition when it fits", () => {
    const picked = pickRendition(
      [
        candidate("efficient", 20 * MB),
        candidate("high_quality", 60 * MB),
        candidate("original", 900 * MB),
      ],
      limit,
    );
    expect(picked?.rendition).toBe("efficient");
  });

  it("falls down the ladder past renditions that are over the limit", () => {
    const picked = pickRendition(
      [candidate("efficient", 400 * MB), candidate("high_quality", 80 * MB)],
      limit,
    );
    expect(picked?.rendition).toBe("high_quality");
  });

  it("accepts a rendition whose size Frame.io did not report", () => {
    const picked = pickRendition([candidate("efficient", null)], limit);
    expect(picked?.rendition).toBe("efficient");
  });

  it("treats a rendition exactly at the limit as a fit", () => {
    expect(pickRendition([candidate("efficient", limit)], limit)?.rendition).toBe("efficient");
  });

  it("returns null when every rendition is over the limit", () => {
    const picked = pickRendition(
      [candidate("efficient", 200 * MB), candidate("original", 900 * MB)],
      limit,
    );
    expect(picked).toBeNull();
  });

  it("returns null when the file has no renditions at all", () => {
    expect(pickRendition([], limit)).toBeNull();
  });
});

describe("formatBytes", () => {
  it("renders megabytes to one decimal", () => {
    expect(formatBytes(24 * MB)).toBe("24.0MB");
  });
});
