"use client";

import { parseAsArrayOf, parseAsString, useQueryStates } from "nuqs";
import type { TaxonomyRef } from "@/entities/taxonomy";
import { FilterDropdown } from "./filter-dropdown";

const filterParsers = {
  clients: parseAsArrayOf(parseAsString).withDefault([]),
  industries: parseAsArrayOf(parseAsString).withDefault([]),
  categories: parseAsArrayOf(parseAsString).withDefault([]),
  contentTypes: parseAsArrayOf(parseAsString).withDefault([]),
  adTypes: parseAsArrayOf(parseAsString).withDefault([]),
  platforms: parseAsArrayOf(parseAsString).withDefault([]),
};

type FacetKey = keyof typeof filterParsers;

const FACETS: readonly { key: FacetKey; label: string }[] = [
  { key: "clients", label: "By Client" },
  { key: "industries", label: "By Industry" },
  { key: "categories", label: "By Category" },
  { key: "contentTypes", label: "By Style" },
  { key: "adTypes", label: "By Ad Type" },
  { key: "platforms", label: "By Platform" },
];

type FilterBarProps = Record<FacetKey, TaxonomyRef[]>;

export function FilterBar(facets: FilterBarProps) {
  const [filters, setFilters] = useQueryStates(filterParsers, { shallow: false });

  return (
    <div className="flex flex-wrap items-center gap-filter-gap">
      {FACETS.map(({ key, label }) => (
        <FilterDropdown
          key={key}
          label={label}
          options={facets[key].map((ref) => ({ value: ref.slug, label: ref.name }))}
          selected={filters[key]}
          onChange={(values) => setFilters({ [key]: values })}
        />
      ))}
    </div>
  );
}
