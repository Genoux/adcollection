"use client";

import { useRowLabel } from "@payloadcms/ui";

export function LogoRowLabel() {
  const { data, rowNumber } = useRowLabel<{ name?: string }>();
  return <span>{data?.name || `Logo ${(rowNumber ?? 0) + 1}`}</span>;
}
