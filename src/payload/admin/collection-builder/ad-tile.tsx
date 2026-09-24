"use client";

import { Check, Play, Plus, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { AdListItem } from "@/entities/ad";
import styles from "@/payload/admin/collection-builder/builder.module.css";

interface AdTileProps {
  ad: AdListItem;
  isSelected: boolean;
  readOnly?: boolean;
  toggleLabel: "add" | "remove";
  onOpen: () => void;
  onToggle: () => void;
}

export function AdTile({ ad, isSelected, readOnly, toggleLabel, onOpen, onToggle }: AdTileProps) {
  const [isPreviewing, setIsPreviewing] = useState(false);
  const removes = toggleLabel === "remove" || isSelected;
  const ToggleIcon = toggleLabel === "remove" ? X : isSelected ? Check : Plus;

  return (
    <div className={styles.tile} data-selected={isSelected || undefined}>
      <button
        type="button"
        className={styles.media}
        onClick={onOpen}
        onMouseEnter={() => setIsPreviewing(true)}
        onMouseLeave={() => setIsPreviewing(false)}
        aria-label={`Quick view ${ad.thumbnailTitle}`}
      >
        <Image src={ad.thumbnailUrl} alt="" fill sizes="14rem" className={styles.cover} />
        {isPreviewing && (
          <video src={ad.videoUrl} className={styles.cover} autoPlay muted loop playsInline />
        )}
        <span className={styles.play} aria-hidden>
          <Play size={14} fill="currentColor" />
        </span>
      </button>
      {!readOnly && (
        <button
          type="button"
          className={styles.toggle}
          data-variant={toggleLabel}
          data-active={isSelected || undefined}
          onClick={onToggle}
          aria-pressed={toggleLabel === "add" ? isSelected : undefined}
          aria-label={`${removes ? "Remove" : "Add"} ${ad.thumbnailTitle} ${removes ? "from" : "to"} collection`}
        >
          <ToggleIcon size={16} strokeWidth={2.5} />
        </button>
      )}
      <div className={styles.caption}>
        <span className={styles.title}>{ad.thumbnailTitle}</span>
        <span className={styles.meta}>
          {[ad.client?.name, ad.platform.name].filter(Boolean).join(" · ")}
        </span>
      </div>
    </div>
  );
}
