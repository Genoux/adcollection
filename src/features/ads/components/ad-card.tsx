"use client";

import { Bookmark } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { AdListItem } from "@/entities/ad";
import { useFavorites } from "@/features/favorites/hooks/use-favorites";
import { Pill } from "@/shared/components/pill";
import { cn } from "@/shared/lib/utils";

type VisibilityCallback = (visible: boolean) => void;

let sharedVisibilityObserver: IntersectionObserver | null = null;
const visibilityCallbacks = new Map<Element, VisibilityCallback>();

// One IntersectionObserver for every card on the page instead of one per card -
// the grid can hold dozens of these and a scroll listener or per-card observer
// would be the actual perf cost the original was missing.
function getVisibilityObserver(): IntersectionObserver {
  sharedVisibilityObserver ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        visibilityCallbacks.get(entry.target)?.(entry.isIntersecting);
      }
    },
    { threshold: 0.5 },
  );
  return sharedVisibilityObserver;
}

function observeVisibility(element: Element, callback: VisibilityCallback): () => void {
  visibilityCallbacks.set(element, callback);
  getVisibilityObserver().observe(element);
  return () => {
    visibilityCallbacks.delete(element);
    getVisibilityObserver().unobserve(element);
  };
}

interface AdCardProps {
  ad: AdListItem;
}

export function AdCard({ ad }: AdCardProps) {
  const { isFavorite, toggle } = useFavorites();
  const favorite = isFavorite(ad.slug);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPreviewActive, setIsPreviewActive] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (supportsHover) {
      const onEnter = () => setIsPreviewActive(true);
      const onLeave = () => setIsPreviewActive(false);
      container.addEventListener("mouseenter", onEnter);
      container.addEventListener("mouseleave", onLeave);
      return () => {
        container.removeEventListener("mouseenter", onEnter);
        container.removeEventListener("mouseleave", onLeave);
      };
    }

    return observeVisibility(container, setIsPreviewActive);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!isPreviewActive) {
      video.pause();
      video.removeAttribute("src");
      video.load();
      return;
    }

    video.src = ad.videoUrl;
    video.play().catch(() => {});
  }, [isPreviewActive, ad.videoUrl]);

  const detailHref = `/${ad.platform.slug}/${ad.slug}`;
  const isTikTok = ad.platform.slug === "tiktok";

  return (
    <div ref={containerRef} className="group flex flex-col">
      {/* Fixed 400px box with a 125%-scaled cover image, matching the original:
          the media deliberately overfills so every card crops to one height. */}
      <div className="relative h-card-media w-full overflow-hidden rounded-card bg-chip transition-shadow duration-200 group-hover:shadow-card-hover">
        <Link href={detailHref} aria-label={ad.thumbnailTitle} className="absolute inset-0 block">
          <Image
            src={ad.thumbnailUrl}
            alt=""
            fill
            sizes="(min-width: 992px) 25vw, (min-width: 480px) 50vw, 100vw"
            className="scale-125 object-cover"
          />
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            preload="none"
            className={cn(
              "absolute inset-0 h-full w-full scale-125 object-cover opacity-0 transition-opacity duration-200",
              isPreviewActive && "opacity-100",
            )}
          />
        </Link>

        <button
          type="button"
          onClick={() => toggle(ad.slug)}
          aria-label={
            favorite
              ? `Remove ${ad.thumbnailTitle} from favorites`
              : `Add ${ad.thumbnailTitle} to favorites`
          }
          aria-pressed={favorite}
          className="cursor-pointer absolute bottom-4 left-4 z-10 flex size-9 items-center justify-center rounded-full bg-white/30 text-white backdrop-blur-sm transition-colors hover:bg-white/50 focus-visible:outline-2 focus-visible:outline-white"
        >
          <Bookmark className={cn("size-4", favorite && "fill-current")} />
        </button>
      </div>

      <Link
        href={detailHref}
        tabIndex={-1}
        className="flex items-center justify-between gap-3 pt-3"
      >
        <div className="flex min-w-0 flex-col">
          <span className="max-w-measure-card-title text-sm font-medium tracking-normal text-heading">
            {ad.thumbnailTitle}
          </span>
          <span className="mt-0.5 truncate text-sm text-black/60">{ad.client?.name}</span>
        </div>

        <Pill tone={isTikTok ? "platform" : "default"} className="shrink-0">
          {ad.platform.name}
        </Pill>
      </Link>
    </div>
  );
}
