import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { RatingRing } from "./rating-ring";

interface RatingWidgetProps {
  ratings: {
    audienceGrab: number | null;
    watchability: number | null;
    clarity: number | null;
  };
  overallScore: number | null;
}

const DIMENSIONS = [
  {
    key: "audienceGrab",
    label: "Audience Grab",
    trackVar: "--color-audience-grab-track",
    fillVar: "--color-audience-grab-fill",
    description: "How well an ad speaks to & captures the attention of the target audience.",
  },
  {
    key: "watchability",
    label: "Watchability",
    trackVar: "--color-watchability-track",
    fillVar: "--color-watchability-fill",
    description:
      "How well an ad can be consumed seamlessly in a feed, without the user noticing that it's an ad.",
  },
  {
    key: "clarity",
    label: "Ad. Clarity",
    trackVar: "--color-clarity-track",
    fillVar: "--color-clarity-fill",
    description: "How clear is the offering? How well are the USPs integrated in the content?",
  },
] as const;

export function RatingWidget({ ratings, overallScore }: RatingWidgetProps) {
  return (
    <div className="mt-12 mb-rating-gap grid grid-cols-1 items-center gap-10 rounded-lg bg-card-alt p-10 lg:grid-split lg:p-16">
      <div className="grid grid-cols-3 gap-6">
        {DIMENSIONS.map((dimension) => (
          <div key={dimension.key} className="flex flex-col items-center gap-3 text-center">
            <RatingRing
              label={dimension.label}
              value={ratings[dimension.key]}
              trackVar={dimension.trackVar}
              fillVar={dimension.fillVar}
            />
            <div className="flex items-center gap-1.5">
              <span className="text-label text-heading">{dimension.label}</span>
              <Tooltip>
                <TooltipTrigger aria-label={`About ${dimension.label}`}>
                  <span
                    className="flex size-4 items-center justify-center rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: `var(${dimension.fillVar})` }}
                  >
                    ?
                  </span>
                </TooltipTrigger>
                <TooltipContent>{dimension.description}</TooltipContent>
              </Tooltip>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center lg:border-l lg:border-hairline lg:pl-12">
        {/* The legacy site recomputed this client-side and shipped NaN whenever a
            rating hadn't loaded yet. Render the stored value, never re-derive it. */}
        <p className="tabular text-rating-average text-heading">
          {overallScore != null ? overallScore.toFixed(1) : "—"}
        </p>
        <p className="font-medium text-heading">Overall Score</p>
        <div className="mt-1 flex items-center justify-center gap-1.5">
          <span className="text-label text-black/60">How we rate?</span>
          <Tooltip>
            <TooltipTrigger aria-label="How we rate ads">
              <span className="flex size-4 items-center justify-center rounded-full bg-black/20 text-xs font-medium text-white">
                ?
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-70">
              The ads are rated with 3 metrics in mind: Audience Grab, Watchability & Clarity. The
              ratings are aggregated from various industry experts from multiple advertising
              agencies.
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
