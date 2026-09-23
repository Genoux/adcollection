import { z } from "zod";

export const AD_SORT_VALUES = ["newest", "oldest", "score", "title-asc", "title-desc"] as const;

export type AdSort = (typeof AD_SORT_VALUES)[number];

// Accepts both a real array (client calls) and a comma-separated string (URL
// search params via `?industries=beauty,fashion` or nuqs' default array format).
const csvStringArray = z
  .union([z.array(z.string()), z.string()])
  .transform((value) =>
    (Array.isArray(value) ? value : value.split(",")).map((v) => v.trim()).filter(Boolean),
  )
  .default([]);

export const adFilterSchema = z.object({
  contentTypes: csvStringArray,
  industries: csvStringArray,
  angles: csvStringArray,
  platforms: csvStringArray,
  objectives: csvStringArray,
  niches: csvStringArray,
  markets: csvStringArray,
  search: z.string().trim().default(""),
  sort: z.enum(AD_SORT_VALUES).default("newest"),
  cursor: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).default(24),
});

export type AdFilter = z.infer<typeof adFilterSchema>;

// Search params are user-controlled, so `?limit=abc` or `?sort=trending` must not
// take a page down. Anything unparseable falls back to the unfiltered defaults.
export function parseAdFilter(input: unknown): AdFilter {
  const result = adFilterSchema.safeParse(input);
  return result.success ? result.data : adFilterSchema.parse({});
}
