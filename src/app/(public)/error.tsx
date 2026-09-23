"use client";

import { ArrowLeft, RotateCw } from "lucide-react";
import { useEffect } from "react";
import { HistoryBackLink } from "@/shared/components/history-back-link";
import { StatusMessage } from "@/shared/components/layout/status-message";
import { Button } from "@/shared/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  retry: () => void;
}

export default function ErrorPage({ error, retry }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusMessage
      label="Error"
      title="Something went wrong"
      description="This page couldn't load. It's usually temporary, so give it another try."
      actions={
        <>
          <Button asChild variant="outline" size="lg" className="border-black/20 shadow-none">
            <HistoryBackLink fallbackHref="/">
              <ArrowLeft />
              Go back
            </HistoryBackLink>
          </Button>
          <Button size="lg" className="bg-black text-white hover:bg-black/85" onClick={retry}>
            <RotateCw />
            Try again
          </Button>
        </>
      }
    />
  );
}
