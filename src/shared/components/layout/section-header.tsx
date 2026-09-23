import type { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  children?: ReactNode;
}

export function SectionHeader({ title, children }: SectionHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between">
      <h2 className="text-section-title text-heading">{title}</h2>
      {children}
    </div>
  );
}
