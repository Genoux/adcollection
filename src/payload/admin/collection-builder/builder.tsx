"use client";

import { useField } from "@payloadcms/ui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AdListItem } from "@/entities/ad";
import { getAdsByIdsAction } from "@/features/collections/actions/get-ads-by-ids";
import { AdLibrary } from "@/payload/admin/collection-builder/ad-library";
import { AdTile } from "@/payload/admin/collection-builder/ad-tile";
import styles from "@/payload/admin/collection-builder/builder.module.css";
import { QuickView } from "@/payload/admin/collection-builder/quick-view";

export type FacetKey =
  | "contentTypes"
  | "industries"
  | "niches"
  | "angles"
  | "platforms"
  | "objectives"
  | "markets";

export interface FacetOptions {
  key: FacetKey;
  label: string;
  options: { value: string; label: string }[];
}

interface CollectionBuilderProps {
  path: string;
  readOnly?: boolean;
  facets: FacetOptions[];
}

type RelationValue = number | { id: number };

export function CollectionBuilder({ path, readOnly, facets }: CollectionBuilderProps) {
  const { value, setValue } = useField<RelationValue[] | null>({ path });
  const selectedIds = useMemo(
    () => (value ?? []).map((entry) => (typeof entry === "number" ? entry : entry.id)),
    [value],
  );
  const [adsById, setAdsById] = useState(() => new Map<number, AdListItem>());
  const [unavailableIds, setUnavailableIds] = useState(() => new Set<number>());
  const [quickView, setQuickView] = useState<{ ads: AdListItem[]; index: number } | null>(null);
  const requestedIds = useRef(new Set<number>());
  const stripRef = useRef<HTMLDivElement>(null);
  const previousCount = useRef(selectedIds.length);

  // New picks land at the end of a sideways-scrolling row; bring them into view so
  // adding from the library gives visible feedback without moving the page.
  useEffect(() => {
    if (selectedIds.length > previousCount.current) {
      stripRef.current?.scrollTo({ left: stripRef.current.scrollWidth, behavior: "smooth" });
    }
    previousCount.current = selectedIds.length;
  }, [selectedIds.length]);

  const remember = useCallback((ads: AdListItem[]) => {
    for (const ad of ads) requestedIds.current.add(ad.id);
    setAdsById((current) => new Map([...current, ...ads.map((ad) => [ad.id, ad] as const)]));
  }, []);

  // Saved collections arrive as bare ids; fetch cards for any we have not seen.
  // Drafts and deleted ads never come back, and get flagged so they can be removed.
  useEffect(() => {
    const missing = selectedIds.filter((id) => !requestedIds.current.has(id));
    if (missing.length === 0) return;
    for (const id of missing) requestedIds.current.add(id);

    getAdsByIdsAction(missing).then((ads) => {
      remember(ads);
      const found = new Set(ads.map((ad) => ad.id));
      setUnavailableIds(
        (current) => new Set([...current, ...missing.filter((id) => !found.has(id))]),
      );
    });
  }, [selectedIds, remember]);

  const isSelected = useCallback((id: number) => selectedIds.includes(id), [selectedIds]);

  const toggle = useCallback(
    (ad: AdListItem) => {
      remember([ad]);
      setValue(
        selectedIds.includes(ad.id)
          ? selectedIds.filter((id) => id !== ad.id)
          : [...selectedIds, ad.id],
      );
    },
    [remember, selectedIds, setValue],
  );

  const removeId = (id: number) => setValue(selectedIds.filter((entry) => entry !== id));

  const selectedAds = selectedIds.flatMap((id) => adsById.get(id) ?? []);
  const closeQuickView = useCallback(() => setQuickView(null), []);
  const changeQuickViewIndex = useCallback(
    (index: number) => setQuickView((current) => current && { ...current, index }),
    [],
  );

  return (
    <div className={styles.builder}>
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>In this collection</h3>
          <span className={styles.count}>{selectedIds.length}</span>
        </div>
        {selectedIds.length === 0 ? (
          <p className={styles.empty}>No ads yet. Add some from the library below.</p>
        ) : (
          <div ref={stripRef} className={styles.strip}>
            {selectedIds.map((id) => {
              const ad = adsById.get(id);
              if (ad) {
                return (
                  <AdTile
                    key={id}
                    ad={ad}
                    isSelected
                    readOnly={readOnly}
                    toggleLabel="remove"
                    onOpen={() =>
                      setQuickView({ ads: selectedAds, index: selectedAds.indexOf(ad) })
                    }
                    onToggle={() => toggle(ad)}
                  />
                );
              }
              return (
                <div key={id} className={styles.placeholder}>
                  <span>{unavailableIds.has(id) ? "Unpublished or deleted ad" : "Loading…"}</span>
                  {!readOnly && unavailableIds.has(id) && (
                    <button type="button" className={styles.link} onClick={() => removeId(id)}>
                      Remove
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <AdLibrary
        facets={facets}
        readOnly={readOnly}
        isSelected={isSelected}
        onToggle={toggle}
        onOpen={(ads, index) => setQuickView({ ads, index })}
      />

      {quickView && (
        <QuickView
          ads={quickView.ads}
          index={quickView.index}
          readOnly={readOnly}
          isSelected={isSelected}
          onToggle={toggle}
          onIndexChange={changeQuickViewIndex}
          onClose={closeQuickView}
        />
      )}
    </div>
  );
}
