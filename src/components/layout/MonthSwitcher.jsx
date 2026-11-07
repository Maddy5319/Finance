import { addMonths, format, isSameMonth, startOfMonth } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function MonthSwitcher({ month, onChange }) {
  const thisMonth = startOfMonth(new Date());
  const canGoNext = !isSameMonth(month, thisMonth);

  return (
    <div className="flex items-center gap-0.5 rounded-xl border border-border bg-card p-1 shadow-card">
      <button
        type="button"
        onClick={() => onChange(addMonths(month, -1))}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        aria-label="Previous month"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="min-w-[104px] text-center text-[12.5px] font-medium text-foreground tnum">
        {format(month, "MMM yyyy")}
      </span>
      <button
        type="button"
        onClick={() => canGoNext && onChange(addMonths(month, 1))}
        disabled={!canGoNext}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
        aria-label="Next month"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}