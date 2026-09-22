import { Link2 } from "lucide-react";
import type { ReactNode } from "react";
import type { AdDetail } from "@/entities/ad";
import { Pill } from "@/shared/components/pill";
import { CopyLinkButton } from "./copy-link-button";
import { FavoriteButton } from "./favorite-button";

interface AdHeaderProps {
  ad: AdDetail;
}

function formatWebsiteLabel(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

// The inBeat mark as it appears in the original pill: a filled dot beside a heart.
function InBeatMark() {
  return (
    <svg width="20" height="9" viewBox="0 0 20 9" fill="none" aria-hidden="true">
      <path
        d="M14.4505 8.76367C14.4209 8.76367 14.3872 8.75513 14.3619 8.73806C14.0875 8.55875 13.7964 8.36238 13.4503 8.1105C12.4375 7.38475 11.6061 6.68462 10.9056 5.97595C9.9476 5.00687 9.50448 4.00363 9.54669 2.91074C9.54669 1.63855 10.4878 0.549936 11.7412 0.379172C11.7412 0.379172 11.8424 0.366365 11.872 0.362096C11.9353 0.357827 12.0028 0.353557 12.0703 0.353557C12.5092 0.345019 12.9439 0.430401 13.3321 0.596896C13.7921 0.793274 14.1297 1.10492 14.4463 1.42083C14.7628 1.10492 15.1004 0.793274 15.5604 0.596896C15.9571 0.430401 16.3917 0.349288 16.818 0.353557C16.8939 0.353557 16.9615 0.357827 17.029 0.362096C17.0543 0.366365 17.1556 0.374903 17.1556 0.374903C18.409 0.545667 19.35 1.63429 19.35 2.91074C19.3922 4.00363 18.9449 5.00687 17.9912 5.97595C17.2906 6.68889 16.4593 7.38475 15.4464 8.1105C15.1004 8.35811 14.8092 8.55875 14.5349 8.73806C14.5096 8.75513 14.48 8.76367 14.4505 8.76367Z"
        fill="currentColor"
      />
      <path
        d="M1.23453 7.49818C0.412847 6.65248 0 5.6435 0 4.46705C0 3.31992 0.412847 2.33606 1.23453 1.5071C2.05622 0.678149 3.03021 0.263672 4.15652 0.263672C5.22271 0.263672 6.15261 0.678149 6.95025 1.5071C7.74387 2.33606 8.14069 3.3241 8.14069 4.46705C8.14069 5.6435 7.75189 6.65248 6.97029 7.49818C6.1927 8.33969 5.25477 8.76254 4.15652 8.76254C3.03021 8.76254 2.05622 8.33969 1.23453 7.49818Z"
        fill="currentColor"
      />
    </svg>
  );
}

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-b border-hairline py-3">
      <dt className="text-label text-black/60">{label}</dt>
      <dd className="mt-1 leading-6 text-black">{children}</dd>
    </div>
  );
}

export function AdHeader({ ad }: AdHeaderProps) {
  return (
    <div className="flex flex-col p-1">
      {/* Only ads inBeat produced carry the badge; the rest lead straight with the title. */}
      {ad.madeWithInbeat && (
        <a
          href="https://inbeat.co"
          target="_blank"
          rel="noopener noreferrer"
          className="brand-gradient transition-colors border border-transparent hover:border-black/50 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-2 tracking-wide text-xs font-medium text-black"
        >
          <InBeatMark />
          Made with inBeat
        </a>
      )}

      <h1 className="mt-2 border-b border-hairline pt-2 pb-6 text-h2 text-heading">
        {ad.thumbnailTitle}
      </h1>

      <dl className="flex flex-col">
        <InfoRow label="Product/Brand">{ad.companyName}</InfoRow>

        <InfoRow label="Website">
          {ad.companyWebsiteUrl ? (
            <a
              href={ad.companyWebsiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 underline underline-offset-2"
            >
              <Link2 className="size-3.5 shrink-0" />
              {ad.companyWebsiteDisplay ?? formatWebsiteLabel(ad.companyWebsiteUrl)}
            </a>
          ) : (
            <span className="text-label">-</span>
          )}
        </InfoRow>

        <InfoRow label="Tags">
          <div className="flex flex-wrap gap-2">
            <Pill tone="platform">{ad.platform.name}</Pill>
            {ad.client && <Pill tone="default">{ad.client.name}</Pill>}
            {ad.industry && <Pill tone="default">{ad.industry.name}</Pill>}
            {ad.category && <Pill tone="default">{ad.category.name}</Pill>}
            {ad.subcategories.map((subcategory) => (
              <Pill key={subcategory.id} tone="default">
                {subcategory.name}
              </Pill>
            ))}
            {ad.contentTypes.map((contentType) => (
              <Pill key={contentType.id} tone="default">
                {contentType.name}
              </Pill>
            ))}
            {ad.adTypes.map((adType) => (
              <Pill key={adType.id} tone="default">
                {adType.name}
              </Pill>
            ))}
          </div>
        </InfoRow>
      </dl>

      <div className="mt-8 flex items-center gap-3">
        <FavoriteButton slug={ad.slug} />
        <CopyLinkButton />
      </div>
    </div>
  );
}
