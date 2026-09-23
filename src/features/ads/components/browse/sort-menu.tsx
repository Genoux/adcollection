"use client";

import { ArrowUpDown, Check } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { AD_SORT_VALUES, type AdSort } from "@/features/ads/schemas";

const SORT_LABELS: Record<AdSort, string> = {
  newest: "Newest",
  oldest: "Oldest",
  score: "Best rated",
  "title-asc": "A to Z",
  "title-desc": "Z to A",
};

interface SortMenuProps {
  value: AdSort;
  onChange: (value: AdSort) => void;
}

export function SortMenu({ value, onChange }: SortMenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={`Sort: ${SORT_LABELS[value]}`}
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-hairline bg-white text-heading transition-colors hover:border-black/20 data-[state=open]:border-black/25"
        >
          <ArrowUpDown className="size-3.5" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-50 min-w-40 rounded-md border border-hairline bg-white p-1 shadow-card data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0"
        >
          <DropdownMenu.RadioGroup value={value} onValueChange={(next) => onChange(next as AdSort)}>
            {AD_SORT_VALUES.map((sort) => (
              <DropdownMenu.RadioItem
                key={sort}
                value={sort}
                className="flex cursor-pointer items-center justify-between gap-4 rounded-sm px-2 py-1.5 text-sm text-body outline-none data-highlighted:bg-chip"
              >
                {SORT_LABELS[sort]}
                <DropdownMenu.ItemIndicator>
                  <Check className="size-3.5" />
                </DropdownMenu.ItemIndicator>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
