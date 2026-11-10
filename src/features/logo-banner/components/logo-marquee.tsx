import Image from "next/image";
import type { BannerLogo } from "@/features/logo-banner/queries/get-banner-logos";

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
  return (
    <section
      aria-label="Brands we've worked with"
      className="overflow-hidden mask-x-from-95% mask-x-to-100%"
    >
      {/* Two identical rows sliding by -50% loop seamlessly. */}
      <div className="flex w-max animate-marquee motion-reduce:animate-none">
        <LogoRow logos={logos} />
        <LogoRow logos={logos} hidden />
      </div>
    </section>
  );
}
