import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

// Pinned to the one bucket the app uploads to. A `*.r2.dev` wildcard would let the
// image optimizer proxy any R2 bucket on the internet.
const r2PublicBaseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL;

if (!r2PublicBaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_R2_PUBLIC_BASE_URL is required at build time to allow-list the image host.",
  );
}

const r2PublicHostname = new URL(r2PublicBaseUrl).hostname;

const nextConfig: NextConfig = {
  // Local dev is served on this hostname because the dev certificate and the Adobe
  // OAuth redirect URI are both issued for it; without this, Next blocks it from
  // the dev bundles and HMR and the admin renders blank.
  allowedDevOrigins: ["local.adcollection.co"],
  experimental: {
    globalNotFound: true,
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: r2PublicHostname }],
  },
};

export default withPayload(nextConfig);
