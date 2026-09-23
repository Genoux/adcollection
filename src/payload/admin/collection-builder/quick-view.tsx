"use client";

import { Button } from "@payloadcms/ui";
import { ChevronLeft, ChevronRight, ExternalLink, X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { AdListItem } from "@/entities/ad";
import styles from "@/payload/admin/collection-builder/builder.module.css";

interface QuickViewProps {
  ads: AdListItem[];
  index: number;
  readOnly?: boolean;
  isSelected: (id: number) => boolean;
  onToggle: (ad: AdListItem) => void;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

export function QuickView({
  ads,
  index,
  readOnly,
  isSelected,
  onToggle,
  onIndexChange,
  onClose,
}: QuickViewProps) {
  const ad = ads[index];
  const hasPrevious = index > 0;
  const hasNext = index < ads.length - 1;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && hasPrevious) onIndexChange(index - 1);
      if (event.key === "ArrowRight" && hasNext) onIndexChange(index + 1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [index, hasPrevious, hasNext, onClose, onIndexChange]);

  if (!ad) return null;

  const selected = isSelected(ad.id);
  const tags = [ad.industry, ...ad.contentTypes, ...ad.angles].flatMap((tag) =>
    tag ? [tag.name] : [],
  );

  // Portalled to <body> so the admin's own stacking contexts cannot clip the overlay.
  return createPortal(
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={ad.thumbnailTitle}>
      <button
        type="button"
        className={styles.backdrop}
        onClick={onClose}
        aria-label="Close quick view"
      />
      <div className={styles.dialog}>
        <div className={styles.player}>
          {/* biome-ignore lint/a11y/useMediaCaption: source ads have no caption tracks. */}
          <video
            key={ad.id}
            src={ad.videoUrl}
            poster={ad.thumbnailUrl}
            className={styles.playerVideo}
            autoPlay
            controls
            loop
            playsInline
          />
        </div>
        <div className={styles.details}>
          <div className={styles.detailsTop}>
            <div className={styles.stepper}>
              <button
                type="button"
                className={styles.iconButton}
                disabled={!hasPrevious}
                onClick={() => onIndexChange(index - 1)}
                aria-label="Previous ad"
              >
                <ChevronLeft size={18} />
              </button>
              <span className={styles.counter}>
                {index + 1} of {ads.length}
              </span>
              <button
                type="button"
                className={styles.iconButton}
                disabled={!hasNext}
                onClick={() => onIndexChange(index + 1)}
                aria-label="Next ad"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <button
              type="button"
              className={styles.iconButton}
              onClick={onClose}
              aria-label="Close quick view"
            >
              <X size={18} />
            </button>
          </div>

          <div className={styles.detailsBody}>
            <h2 className={styles.detailsTitle}>{ad.thumbnailTitle}</h2>
            <p className={styles.detailsMeta}>
              {[ad.client?.name, ad.platform.name].filter(Boolean).join(" · ")}
              {ad.overallScore !== null && ` · Score ${ad.overallScore}`}
            </p>
            {tags.length > 0 && (
              <div className={styles.tags}>
                {tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className={styles.detailsActions}>
            {!readOnly && (
              <Button
                buttonStyle={selected ? "pill" : "primary"}
                margin={false}
                onClick={() => onToggle(ad)}
              >
                {selected ? "Remove from collection" : "Add to collection"}
              </Button>
            )}
            <a
              className={styles.textLink}
              href={`/${ad.platform.slug}/${ad.slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open ad page <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
