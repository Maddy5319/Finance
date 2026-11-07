import { Info, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const TONES = {
  good: {
    wrap: "border-success/25 bg-success/[0.06]",
    icon: "bg-success/12 text-success",
    chip: "bg-card text-success",
    Trend: TrendingDown,
  },
  watch: {
    wrap: "border-warning/30 bg-warning/[0.07]",
    icon: "bg-warning/12 text-warning",
    chip: "bg-card text-warning",
    Trend: Info,
  },
  tight: {
    wrap: "border-destructive/25 bg-destructive/[0.05]",
    icon: "bg-destructive/12 text-destructive",
    chip: "bg-card text-destructive",
    Trend: TrendingUp,
  },
};

export default function FeedbackNote({ tone = "good", headline, body, chip }) {
  const config = TONES[tone] || TONES.watch;
  const Trend = config.Trend;

  return (
    <div className={cn("rounded-2xl border px-4 py-3.5 sm:px-5", config.wrap)}>
      <div className="flex items-start gap-3">
        <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", config.icon)}>
          <Sparkles className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold leading-snug tracking-[-0.01em] text-foreground">{headline}</p>
          {body ? <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{body}</p> : null}
        </div>
        {chip ? (
          <span
            className={cn(
              "hidden shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-[10.5px] font-semibold tnum sm:inline-flex",
              config.chip
            )}
          >
            <Trend className="h-3 w-3" strokeWidth={2.4} />
            {chip}
          </span>
        ) : null}
      </div>
    </div>
  );
}