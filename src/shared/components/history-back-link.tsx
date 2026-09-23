"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";

type HistoryBackLinkProps = Omit<ComponentProps<typeof Link>, "href" | "onClick"> & {
  fallbackHref: string;
};

// A deep link or fresh tab has no entry to return to, so the plain link takes
// over; modified clicks keep their open-in-new-tab behaviour.
export function HistoryBackLink({ fallbackHref, ...props }: HistoryBackLinkProps) {
  const router = useRouter();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || window.history.length <= 1) return;
    event.preventDefault();
    router.back();
  }

  return <Link href={fallbackHref} onClick={handleClick} {...props} />;
}
