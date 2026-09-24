import { Music } from "lucide-react";
import Image from "next/image";
import type { AdDetail } from "@/entities/ad";

interface CreatorCardProps {
  ad: AdDetail;
}

const WORK_WITH_CREATOR_URL = "https://inbeat.agency/";

const ctaButton =
  "block rounded-sm px-6 py-3 text-center leading-6 bg-black/10 text-black transition-colors hover:bg-black hover:text-white";

export function CreatorCard({ ad }: CreatorCardProps) {
  const { client, creator, caption, soundName, soundUrl, originalUrl, madeWithInbeat } = ad;

  // The video panel slot is the client's own account, not the creator's - fall back to
  // the creator handle so clients without a handle still show something.
  const topHandle = client?.handle ?? creator?.handle;
  const topHandleUrl = client?.handle ? client.handleUrl : creator?.profileUrl;
  const profilePictureUrl = client?.logoUrl;
  const topHandleInitials = topHandle?.slice(0, 2).toUpperCase() ?? "";

  return (
    <div className="flex flex-col p-5">
      {topHandle && (
        <div className="flex items-center gap-1.5">
          <span className="flex size-avatar shrink-0 items-center justify-center overflow-hidden rounded-pill border border-chip bg-chip text-micro font-medium text-black/60">
            {profilePictureUrl ? (
              <Image
                src={profilePictureUrl}
                alt=""
                width={21}
                height={21}
                className="size-full object-cover"
              />
            ) : (
              topHandleInitials
            )}
          </span>
          {topHandleUrl ? (
            <a
              href={topHandleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-heading hover:underline w-fit"
            >
              @{topHandle}
            </a>
          ) : (
            <span className="font-medium text-heading">@{topHandle}</span>
          )}
        </div>
      )}

      {caption && <p className="my-3 text-sm text-black/60">{caption}</p>}

      {soundName && (
        <div className="flex items-center gap-1.5 text-label text-black">
          <Music className="size-3.5 shrink-0" />
          {soundUrl ? (
            <a
              href={soundUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {soundName}
            </a>
          ) : (
            <span>{soundName}</span>
          )}
        </div>
      )}

      {/* Pinned to the bottom of the panel so the CTA aligns with the video's lower edge.
          The two calls to action are mutually exclusive: ads inBeat produced sell the
          creator, everything else just credits them and links back to the original post. */}
      <div className="mt-auto flex flex-col gap-3 pt-8">
        {madeWithInbeat ? (
          <a
            href={WORK_WITH_CREATOR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="brand-cycle-hover block rounded-sm bg-black px-6 py-3 text-center leading-6 text-white"
          >
            Work with this Creator
          </a>
        ) : (
          <div className="flex flex-col gap-6">
            {creator && (
              <div className="flex flex-col gap-1">
                <p className="border-t border-hairline pt-6 text-label text-black/60">
                  Creator Credits
                </p>
                {creator.profileUrl ? (
                  <a
                    href={creator.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-heading hover:underline w-fit"
                  >
                    @{creator.handle}
                  </a>
                ) : (
                  <span className="font-medium text-heading">@{creator.handle}</span>
                )}
              </div>
            )}
            {originalUrl && (
              <a href={originalUrl} target="_blank" rel="noopener noreferrer" className={ctaButton}>
                Link to Original
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
