import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { HistoryBackLink } from "@/shared/components/history-back-link";
import { StatusMessage } from "@/shared/components/layout/status-message";
import { Button } from "@/shared/components/ui/button";

export const NOT_FOUND_TITLE = "Page Not Found";
export const NOT_FOUND_DESCRIPTION =
  "The ad you're looking for doesn't exist or may have been removed.";

export function NotFoundContent() {
  return (
    <StatusMessage
      label="404"
      title={NOT_FOUND_TITLE}
      description={NOT_FOUND_DESCRIPTION}
      actions={
        <>
          <Button asChild variant="outline" size="lg" className="border-black/20 shadow-none">
            <HistoryBackLink fallbackHref="/">
              <ArrowLeft />
              Go back
            </HistoryBackLink>
          </Button>
          <Button asChild size="lg" className="bg-black text-white hover:bg-black/85">
            <Link href="/ads">Browse all ads</Link>
          </Button>
        </>
      }
    />
  );
}
