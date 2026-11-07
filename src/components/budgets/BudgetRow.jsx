import CategoryIcon from "@/components/icons/CategoryIcon";
import { CURRENCY_SYMBOL, categoryColor, categoryTint, money } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function BudgetRow({ row, value, onChange, onCommit }) {
  const { category, spent, budget } = row;
  const accent = categoryColor(category.color);
  const limit = Number(value) || 0;
  const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
  const over = limit > 0 && spent > limit;
  const near = limit > 0 && !over && pct >= 80;

  const status = limit === 0 ? null : over ? "Over" : near ? "Close" : "On track";

  return (
    <div className="py-3.5 first:pt-0 last:pb-0">
      <div className="flex items-center gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: categoryTint(category.color), color: accent }}
        >
          <CategoryIcon name={category.icon} className="h-4 w-4" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-[13px] font-medium tracking-[-0.01em] text-foreground">{category.name}</p>
            {status ? (
              <span
                className={cn(
                  "shrink-0 rounded-md px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.06em]",
                  over
                    ? "bg-destructive/10 text-destructive"
                    : near
                      ? "bg-warning/12 text-warning"
                      : "bg-success/10 text-success"
                )}
              >
                {status}
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground tnum">
            {money(spent)} spent{limit > 0 ? ` · ${money(Math.max(limit - spent, 0))} left` : " · no limit set"}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1.5 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10">
          <span className="text-[12px] text-muted-foreground">{CURRENCY_SYMBOL}</span>
          <input
            value={value}
            onChange={(e) => onChange(e.target.value.replace(/[^\d.]/g, ""))}
            onBlur={() => onCommit(value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.currentTarget.blur();
              }
            }}
            inputMode="decimal"
            placeholder="0"
            aria-label={`Monthly limit for ${category.name}`}
            className="w-[66px] bg-transparent text-right text-[12.5px] font-semibold text-foreground outline-none tnum placeholder:text-muted-foreground/50"
          />
        </div>
      </div>

      <div className="mt-2.5 flex items-center gap-2.5 pl-12">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{
              width: `${limit > 0 ? Math.min(Math.max(pct, spent > 0 ? 3 : 0), 100) : 0}%`,
              backgroundColor: over ? "hsl(var(--destructive))" : near ? "hsl(var(--warning))" : accent,
            }}
          />
        </div>
        <span className={cn("w-[38px] shrink-0 text-right text-[10.5px] tnum", over ? "text-destructive" : "text-muted-foreground")}>
          {limit > 0 ? `${pct}%` : "—"}
        </span>
      </div>
    </div>
  );
}