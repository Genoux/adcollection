"use client";

import { Banner, Button, Drawer, toast, useDrawerSlug, useField, useModal } from "@payloadcms/ui";
import { useCallback, useEffect, useState } from "react";
import styles from "@/payload/admin/frameio-picker/picker.module.css";
import type {
  BrowseResponse,
  ImportResponse,
  PickerError,
  PickerItem,
  PickerPlace,
} from "@/payload/admin/frameio-picker/types";
import { FrameioLogo } from "@/payload/admin/integrations/frameio-logo";

type Props = {
  path: string;
  readOnly?: boolean;
  thumbnailPath: string;
};

type Listing = { items: PickerItem[]; next: null | string };

const browseUrl = (place: PickerPlace | undefined, after?: string) => {
  const params = new URLSearchParams();
  if (place) params.set(place.kind, place.id);
  if (after) params.set("after", after);
  return `/api/frameio/browse?${params}`;
};

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const body = await response.json();
  if (!response.ok) throw body as PickerError;
  return body as T;
}

const FolderIcon = () => (
  <svg aria-hidden="true" fill="currentColor" height="32" viewBox="0 0 24 24" width="32">
    <path d="M10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8l-2-2Z" />
  </svg>
);

function Tile({
  disabled,
  item,
  onOpen,
  onPick,
  status,
}: {
  disabled: boolean;
  item: PickerItem;
  onOpen: (place: PickerPlace) => void;
  onPick: (item: PickerItem) => void;
  status?: string;
}) {
  const isVideo = item.kind === "video";
  const badge =
    status ?? (item.kind === "stack" ? "Versions" : isVideo && !item.ready ? "Processing" : null);

  return (
    <button
      className={styles.tile}
      disabled={disabled || (isVideo && !item.ready)}
      onClick={() => (isVideo ? onPick(item) : onOpen(item))}
      title={item.name}
      type="button"
    >
      <div className={styles.preview}>
        {isVideo && item.thumbnail ? (
          // biome-ignore lint/performance/noImgElement: short-lived signed Frame.io URLs; next/image would cache links that expire.
          <img alt="" src={item.thumbnail} />
        ) : (
          <FolderIcon />
        )}
      </div>
      <span className={styles.name}>{item.name}</span>
      {badge && <span className={styles.badge}>{badge}</span>}
    </button>
  );
}

function PickerBody({
  onImported,
}: {
  onImported: (result: ImportResponse, name: string) => void;
}) {
  const [trail, setTrail] = useState<PickerPlace[]>([]);
  const [listing, setListing] = useState<Listing | null>(null);
  const [error, setError] = useState<PickerError | null>(null);
  const [importing, setImporting] = useState<null | string>(null);
  const place = trail.at(-1);

  useEffect(() => {
    let cancelled = false;
    setListing(null);
    setError(null);
    request<BrowseResponse>(browseUrl(place))
      .then((page) => !cancelled && setListing(page))
      .catch((failure: PickerError) => !cancelled && setError(failure));
    return () => {
      cancelled = true;
    };
  }, [place]);

  const loadMore = async () => {
    if (!listing?.next) return;
    try {
      const page = await request<BrowseResponse>(browseUrl(place, listing.next));
      setListing({ items: [...listing.items, ...page.items], next: page.next });
    } catch (failure) {
      setError(failure as PickerError);
    }
  };

  const pick = async (item: PickerItem) => {
    setImporting(item.id);
    setError(null);
    try {
      const result = await request<ImportResponse>("/api/frameio/import", {
        body: JSON.stringify({ fileId: item.id }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      onImported(result, item.name);
    } catch (failure) {
      setError(failure as PickerError);
    } finally {
      setImporting(null);
    }
  };

  return (
    <>
      <nav className={styles.crumbs}>
        {[{ id: "", kind: "folder" as const, name: "Projects" }, ...trail].map((crumb, index) => {
          const isCurrent = index === trail.length;
          return (
            <span className={styles.crumbItem} key={`${crumb.kind}-${crumb.id}`}>
              {index > 0 && <span className={styles.separator}>/</span>}
              <button
                className={`${styles.crumb} ${isCurrent ? styles.crumbCurrent : ""}`}
                disabled={isCurrent || importing !== null}
                onClick={() => setTrail(trail.slice(0, index))}
                type="button"
              >
                {crumb.name}
              </button>
            </span>
          );
        })}
      </nav>

      {error && (
        <Banner type="error">
          {error.error} {error.connectUrl && <a href={error.connectUrl}>Connect Frame.io</a>}
        </Banner>
      )}

      {!listing && !error && <p className={styles.status}>Loading…</p>}
      {listing?.items.length === 0 && <p className={styles.status}>No videos or folders here.</p>}

      {listing && listing.items.length > 0 && (
        <div className={styles.grid}>
          {listing.items.map((item) => (
            <Tile
              disabled={importing !== null}
              item={item}
              key={item.id}
              onOpen={(next) => setTrail([...trail, next])}
              onPick={pick}
              status={importing === item.id ? "Importing…" : undefined}
            />
          ))}
        </div>
      )}

      {listing?.next && (
        <div className={styles.more}>
          <Button
            buttonStyle="secondary"
            disabled={importing !== null}
            onClick={loadMore}
            size="small"
          >
            Load more
          </Button>
        </div>
      )}
    </>
  );
}

/**
 * Rendered as the upload field's afterInput, so it sits beside Payload's own
 * "Create new / Choose from existing" instead of replacing the field. The
 * poster fills the thumbnail field too, but only when it is still empty.
 */
export function FrameioPicker({ path, readOnly, thumbnailPath }: Props) {
  const slug = useDrawerSlug("frameio-picker");
  const { closeModal, isModalOpen, openModal } = useModal();
  const video = useField<number>({ path });
  const thumbnail = useField<number>({ path: thumbnailPath });

  const onImported = useCallback(
    (result: ImportResponse, name: string) => {
      video.setValue(result.video);
      if (!thumbnail.value) thumbnail.setValue(result.thumbnail);
      closeModal(slug);
      toast.success(`Imported "${name}" from Frame.io`);
    },
    [closeModal, slug, thumbnail, video],
  );

  if (readOnly || video.value) return null;

  return (
    <>
      <div className={styles.trigger}>
        <Button
          buttonStyle="pill"
          icon={<FrameioLogo size={14} />}
          iconPosition="left"
          margin={false}
          onClick={() => openModal(slug)}
          size="small"
        >
          Pick from Frame.io
        </Button>
      </div>
      <Drawer slug={slug} title="Pick from Frame.io">
        {isModalOpen(slug) && <PickerBody onImported={onImported} />}
      </Drawer>
    </>
  );
}
