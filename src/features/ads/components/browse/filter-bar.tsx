"use client";

import { parseAsArrayOf, parseAsString, useQueryStates } from "nuqs";
import type { TaxonomyRef } from "@/entities/taxonomy";
import { FilterDropdown } from "./filter-dropdown";

const filterParsers = {
  contentTypes: parseAsArrayOf(parseAsString).withDefault([]),
  industries: parseAsArrayOf(parseAsString).withDefault([]),
  angles: parseAsArrayOf(parseAsString).withDefault([]),
  platforms: parseAsArrayOf(parseAsString).withDefault([]),
  objectives: parseAsArrayOf(parseAsString).withDefault([]),
};

type FilterKey = keyof typeof filterParsers;

type FilterBarProps = Record<FilterKey, TaxonomyRef[]>;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "contentTypes", label: "By Content Type" },
  { key: "industries", label: "By Industry" },
  { key: "angles", label: "By Angle" },
  { key: "platforms", label: "By Platform" },
  { key: "objectives", label: "By Objective" },
];

export function FilterBar(props: FilterBarProps) {
  const [filters, setFilters] = useQueryStates(filterParsers, { shallow: false });

  return (
    <div className="flex flex-wrap items-center gap-filter-gap">
      {FILTERS.map(({ key, label }) => (
        <FilterDropdown
          key={key}
          label={label}
          options={props[key].map((ref) => ({ value: ref.slug, label: ref.name }))}
          selected={filters[key]}
          onChange={(values) => setFilters({ [key]: values })}
        />
      ))}
    </div>
  );
}
