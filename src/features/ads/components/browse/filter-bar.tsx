"use client";

import {
  debounce,
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import type { TaxonomyRef } from "@/entities/taxonomy";
import { AD_SORT_VALUES } from "@/features/ads/schemas";
import { FilterDrawer } from "./filter-drawer";
import { SearchInput } from "./search-input";
import { SortMenu } from "./sort-menu";

const FACETS = [
  { key: "contentTypes", label: "Content type" },
  { key: "industries", label: "Industry" },
  { key: "niches", label: "Niche" },
  { key: "angles", label: "Angle" },
  { key: "platforms", label: "Platform" },
  { key: "objectives", label: "Objective" },
  { key: "markets", label: "Market" },
] as const;

type FacetKey = (typeof FACETS)[number]["key"];

const facetList = parseAsArrayOf(parseAsString).withDefault([]);

const filterParsers = {
  ...(Object.fromEntries(FACETS.map(({ key }) => [key, facetList])) as Record<
    FacetKey,
    typeof facetList
  >),
  search: parseAsString.withDefault(""),
  sort: parseAsStringLiteral(AD_SORT_VALUES).withDefault("newest"),
};

// Sort is a view preference rather than a narrowing, so "Clear" leaves it alone.
const clearedFilters = {
  ...Object.fromEntries(FACETS.map(({ key }) => [key, null])),
  search: null,
};

// The input updates instantly; only the URL (and so the server query) waits for
// typing to pause. Emptying the box applies at once so clearing never lags.
const SEARCH_DEBOUNCE_MS = 300;

type FilterBarProps = Record<FacetKey, TaxonomyRef[]>;

export function FilterBar(props: FilterBarProps) {
  const [filters, setFilters] = useQueryStates(filterParsers, { shallow: false });
  const activeCount =
    FACETS.reduce((sum, { key }) => sum + filters[key].length, 0) + (filters.search ? 1 : 0);

  const sections = FACETS.map(({ key, label }) => ({
    key,
    label,
    options: props[key].map((ref) => ({ value: ref.slug, label: ref.name })),
    selected: filters[key],
  }));

  return (
    <div className="flex items-center gap-2">
      <FilterDrawer
        sections={sections}
        activeCount={activeCount}
        onChange={(key, values) => setFilters({ [key]: values })}
        onClear={() => setFilters(clearedFilters)}
      />
      <SearchInput
        value={filters.search}
        onChange={(search) =>
          setFilters(
            { search },
            { limitUrlUpdates: search ? debounce(SEARCH_DEBOUNCE_MS) : undefined },
          )
        }
      />
      <div className="ml-auto">
        <SortMenu value={filters.sort} onChange={(sort) => setFilters({ sort })} />
      </div>
    </div>
  );
}
