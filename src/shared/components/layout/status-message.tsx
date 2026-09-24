import type { ReactNode } from "react";
import { Container } from "@/shared/components/layout/container";

interface StatusMessageProps {
  label: string;
  title: string;
  description: string;
  actions: ReactNode;
}

export function StatusMessage({ label, title, description, actions }: StatusMessageProps) {
  return (
    <Container className="flex flex-1 flex-col items-center justify-center py-24 text-center">
      <span className="mb-5 rounded-full bg-chip px-3 py-1 text-xs font-medium tracking-wide text-subtle">
        {label}
      </span>
      <h1 className="text-page-h1 text-heading">{title}</h1>
      <p className="mt-3 max-w-md text-subtle">{description}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">{actions}</div>
    </Container>
  );
}
