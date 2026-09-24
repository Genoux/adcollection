"use client";

import { Button, SelectInput, TextInput } from "@payloadcms/ui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AdListItem } from "@/entities/ad";
import { getAdsPage } from "@/features/ads/components/browse/get-ads-page";
import { AD_SORT_LABELS, AD_SORT_VALUES, type AdSort } from "@/features/ads/schemas";
import { AdTile } from "@/payload/admin/collection-builder/ad-tile";
import type { FacetKey, FacetOptions } from "@/payload/admin/collection-builder/builder";
import styles from "@/payload/admin/collection-builder/builder.module.css";

const PAGE_SIZE = 24;
const SEARCH_DEBOUNCE_MS = 300;
const SORT_OPTIONS = AD_SORT_VALUES.map((value) => ({ value, label: AD_SORT_LABELS[value] }));

type Status = "loading" | "idle" | "error";

// Payload's react-select adapter hands back one option, an array, or null on clear.
function selectedValues(selection: unknown): string[] {
  const options = Array.isArray(selection) ? selection : selection ? [selection] : [];
  return options.map((option: { value: unknown }) => String(option.value));
}

interface AdLibraryProps {
  facets: FacetOptions[];
  readOnly?: boolean;
  isSelected: (id: number) => boolean;
  onToggle: (ad: AdListItem) => void;
  onOpen: (ads: AdListItem[], index: number) => void;
}

export function AdLibrary({ facets, readOnly, isSelected, onToggle, onOpen }: AdLibraryProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState<AdSort>("newest");
  const [facetValues, setFacetValues] = useState<Partial<Record<FacetKey, string[]>>>({});
  const [items, setItems] = useState<AdListItem[]>([]);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const requestRef = useRef(0);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [search]);

  const filter = useMemo(
    () => ({ search: debouncedSearch, sort, ...facetValues }),
    [debouncedSearch, sort, facetValues],
  );

  // Every request gets a ticket so a slow page from a previous filter can never
  // overwrite the results of the current one.
  const load = useCallback(
    async (cursor?: number) => {
      const ticket = ++requestRef.current;
      setStatus("loading");
      if (!cursor) setItems([]);
      try {
        const page = await getAdsPage({ ...filter, cursor, limit: PAGE_SIZE });
        if (ticket !== requestRef.current) return;
        setItems((current) => (cursor ? [...current, ...page.items] : page.items));
        setNextCursor(page.nextCursor);
        setStatus("idle");
      } catch {
        if (ticket === requestRef.current) setStatus("error");
      }
    },
    [filter],
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || nextCursor === null || status !== "idle") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) load(nextCursor);
      },
      { rootMargin: "600px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [nextCursor, status, load]);

  const hasFilters = search !== "" || Object.values(facetValues).some((values) => values?.length);

  function clearFilters() {
    setSearch("");
    setFacetValues({});
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Library</h3>
        <span className={styles.sectionHint}>Hover to preview · click to open · + to add</span>
      </div>

      <div className={styles.toolbar}>
        <TextInput
          path="collection-library-search"
          className={styles.searchField}
          placeholder="Search product, brand, creator, niche, market…"
          value={search}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)}
        />
        <SelectInput
          name="collection-library-sort"
          path="collection-library-sort"
          className={styles.sortField}
          options={SORT_OPTIONS}
          value={sort}
          onChange={(selection) => setSort((selectedValues(selection)[0] ?? "newest") as AdSort)}
        />
      </div>

      <div className={styles.filters}>
        {facets.map(({ key, label, options }) => (
          <SelectInput
            key={key}
            name={`collection-library-${key}`}
            path={`collection-library-${key}`}
            placeholder={label}
            options={options}
            hasMany
            isClearable
            value={facetValues[key] ?? []}
            onChange={(selection) =>
              setFacetValues((current) => ({ ...current, [key]: selectedValues(selection) }))
            }
          />
        ))}
      </div>
      {hasFilters && (
        <div>
          <Button buttonStyle="pill" size="small" margin={false} onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      )}

      {items.length > 0 && (
        <div className={styles.grid}>
          {items.map((ad, index) => (
            <AdTile
              key={ad.id}
              ad={ad}
              isSelected={isSelected(ad.id)}
              readOnly={readOnly}
              toggleLabel="add"
              onOpen={() => onOpen(items, index)}
              onToggle={() => onToggle(ad)}
            />
          ))}
        </div>
      )}

      {status === "loading" && <p className={styles.status}>Loading ads…</p>}
      {status === "idle" && items.length === 0 && (
        <p className={styles.status}>No ads match these filters.</p>
      )}
      {status === "error" && (
        <div className={styles.status}>
          <p>Couldn&apos;t load ads.</p>
          <Button
            buttonStyle="pill"
            size="small"
            margin={false}
            onClick={() => load(items.length > 0 ? (nextCursor ?? undefined) : undefined)}
          >
            Try again
          </Button>
        </div>
      )}
      {nextCursor !== null && <div ref={sentinelRef} aria-hidden />}
    </section>
  );
}
