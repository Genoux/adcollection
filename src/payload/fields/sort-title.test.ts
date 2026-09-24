import { describe, expect, it } from "vitest";
import { toSortTitle } from "./sort-title";

describe("toSortTitle", () => {
  it("folds case so lowercase titles sort among capitalized ones", () => {
    expect(toSortTitle("concerts real do be")).toBe("concerts real do be");
    expect(toSortTitle("Yubo: May cause")).toBe("yubo: may cause");
  });

  it("strips accents so they sort with their base letter instead of after z", () => {
    expect(toSortTitle("Ágape Caótica")).toBe("agape caotica");
  });

  it("trims surrounding whitespace", () => {
    expect(toSortTitle("  Worth the hype ")).toBe("worth the hype");
  });
});
