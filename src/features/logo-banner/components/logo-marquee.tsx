import Image from "next/image";
import type { BannerLogo } from "@/features/logo-banner/queries/get-banner-logos";

// Kept in step with the h-14 and px-10 classes below, which set the rendered size.
const LOGO_HEIGHT_PX = 56;
const LOGO_GAP_PX = 80;
// fieldtrip.agency's desktop logo row: 12 logos × 180px every 45s.
const SCROLL_SPEED_PX_PER_SECOND = 48;

function rowWidth(logos: BannerLogo[]) {
  return logos.reduce(
    (total, logo) => total + (logo.width / logo.height) * LOGO_HEIGHT_PX + LOGO_GAP_PX,
    0,
  );
}

function LogoRow({ logos, hidden }: { logos: BannerLogo[]; hidden?: boolean }) {
  return (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden}>
      {logos.map((logo) => (
        <li key={logo.id} className="px-10">
          <Image
            src={logo.url}
            alt={hidden ? "" : logo.name}
            width={logo.width}
            height={logo.height}
            className="h-14 w-auto"
          />
        </li>
      ))}
    </ul>
  );
}

export function LogoMarquee({ logos }: { logos: BannerLogo[] }) {
  const loopSeconds = rowWidth(logos) / SCROLL_SPEED_PX_PER_SECOND;

  return (
    <section
      aria-label="Brands we've worked with"
      className="overflow-hidden mask-x-from-95% mask-x-to-100%"
    >
      {/* Two identical rows sliding by -50% loop seamlessly. */}
      <div
        className="flex w-max animate-marquee motion-reduce:animate-none"
        style={{ animationDuration: `${loopSeconds.toFixed(1)}s` }}
      >
        <LogoRow logos={logos} />
        <LogoRow logos={logos} hidden />
      </div>
    </section>
  );
}
