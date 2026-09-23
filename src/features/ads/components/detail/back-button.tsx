import { ArrowLeft } from "lucide-react";
import { HistoryBackLink } from "@/shared/components/history-back-link";
import { Button } from "@/shared/components/ui/button";

export function BackButton() {
  return (
    <Button asChild variant="subtle" size="icon-sm">
      <HistoryBackLink fallbackHref="/ads" aria-label="Back">
        <ArrowLeft className="size-5" />
      </HistoryBackLink>
    </Button>
  );
}
