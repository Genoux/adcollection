interface VideoPlayerProps {
  videoUrl: string;
  thumbnailUrl: string;
  title: string;
}

export function VideoPlayer({ videoUrl, thumbnailUrl, title }: VideoPlayerProps) {
  return (
    // Rounding and shadow live on the parent card so the media sits flush inside it.
    <div className="aspect-reel w-full bg-surface-inverse">
      {/* biome-ignore lint/a11y/useMediaCaption: source ads have no caption tracks. */}
      <video
        className="size-full object-cover"
        controls
        playsInline
        // Buffered up front so pressing play starts instantly instead of waiting on the network.
        preload="auto"
        poster={thumbnailUrl}
        aria-label={`${title} video`}
        // Uploads may be mp4, webm or quicktime. A <source type> the browser cannot
        // decode is skipped outright, so let it sniff the real type from the response.
        src={videoUrl}
      />
    </div>
  );
}
