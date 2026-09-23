"use client";

import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { cn } from "@/shared/lib/utils";

export interface FilterSection {
  key: string;
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
}

interface FilterDrawerProps {
  sections: FilterSection[];
  activeCount: number;
  onChange: (key: string, values: string[]) => void;
  onClear: () => void;
}

export function FilterDrawer({ sections, activeCount, onChange, onClear }: FilterDrawerProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={activeCount > 0 ? `Filters (${activeCount} active)` : "Filters"}
          className={cn(
            "flex h-8 min-w-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md border bg-white px-2 text-heading transition-colors data-[state=open]:border-black/25",
            activeCount > 0 ? "border-black/25" : "border-hairline hover:border-black/20",
          )}
        >
          <SlidersHorizontal className="size-3.5" />
          {activeCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-micro font-medium tabular-nums text-white">
              {activeCount}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent side="left" showCloseButton={false} className="w-72 gap-0 sm:max-w-72">
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-hairline py-3 pr-3 pl-4">
          <div className="flex items-center gap-1.5">
            <SheetTitle className="text-sm font-medium">Filters</SheetTitle>
            {activeCount > 0 && (
              <Button variant="subtle" size="xs" className="text-subtle" onClick={onClear}>
                Clear ({activeCount})
              </Button>
            )}
          </div>
          <SheetDescription className="sr-only">Narrow the ads shown in the grid.</SheetDescription>
          <SheetClose asChild>
            <Button variant="subtle" size="icon-sm" aria-label="Close filters">
              <X />
            </Button>
          </SheetClose>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {sections.map((section, index) => (
            <FilterSectionPanel
              key={section.key}
              section={section}
              defaultOpen={index === 0 || section.selected.length > 0}
              onChange={(values) => onChange(section.key, values)}
            />
          ))}
        </div>
        {/* The drawer covers the grid on phones, so results only show once it closes. */}
        <div className="shrink-0 border-t border-hairline p-3 sm:hidden">
          <SheetClose asChild>
            <Button className="w-full">Show results</Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface FilterSectionPanelProps {
  section: FilterSection;
  defaultOpen: boolean;
  onChange: (values: string[]) => void;
}

function FilterSectionPanel({ section, defaultOpen, onChange }: FilterSectionPanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { key, label, options, selected } = section;

  function toggle(value: string) {
    onChange(
      selected.includes(value) ? selected.filter((entry) => entry !== value) : [...selected, value],
    );
  }

  return (
    <div className="flex flex-col">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center justify-between rounded-sm px-2 py-2 text-sm font-medium text-heading transition-colors hover:bg-black/5"
      >
        <span className="flex items-center gap-1.5">
          {label}
          {selected.length > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-micro font-medium tabular-nums text-white">
              {selected.length}
            </span>
          )}
        </span>
        <ChevronDown
          className={cn("size-3.5 text-subtle transition-transform", isOpen && "rotate-180")}
        />
      </button>
      {isOpen && (
        <div className="flex flex-col pb-2">
          {options.length === 0 && (
            <p className="px-2 py-1.5 text-xs text-subtle">No options yet.</p>
          )}
          {options.map((option) => {
            const inputId = `filter-${key}-${option.value}`;
            return (
              <label
                key={option.value}
                htmlFor={inputId}
                className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-body transition-colors hover:bg-chip"
              >
                <Checkbox
                  id={inputId}
                  checked={selected.includes(option.value)}
                  onCheckedChange={() => toggle(option.value)}
                  className="size-3.5 shrink-0 rounded-checkbox border-black/25"
                />
                {option.label}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
