import type { TextField } from "payload";

// The database sorts by byte order (C collation), which puts every capital before
// any lowercase letter and accented letters after "z". Payload's sort cannot wrap a
// column in lower(), so A to Z reads from this folded copy of the display title.
export function toSortTitle(title: string): string {
  return title
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export const sortTitleField: TextField = {
  name: "sortTitle",
  type: "text",
  index: true,
  admin: { hidden: true },
  hooks: {
    beforeChange: [({ siblingData }) => toSortTitle(String(siblingData.thumbnailTitle ?? ""))],
  },
};
