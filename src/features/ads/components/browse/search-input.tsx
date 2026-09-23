"use client";

import { Search, X } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <div className="relative flex-1 sm:max-w-md">
      <Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-2.5 size-3.5 text-subtle" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => event.key === "Escape" && onChange("")}
        placeholder="Search product, brand, creator, niche, market…"
        aria-label="Search ads"
        className="w-full rounded-md border border-hairline bg-white h-8 pr-8 pl-8 text-xs tracking-wide text-heading transition-colors placeholder:text-subtle hover:border-black/20 focus:border-black/25 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="-translate-y-1/2 absolute top-1/2 right-1.5 flex size-5 cursor-pointer items-center justify-center rounded-full text-subtle transition-colors hover:bg-black/5 hover:text-heading"
        >
          <X className="size-3" />
        </button>
      )}
    </div>
  );
}
