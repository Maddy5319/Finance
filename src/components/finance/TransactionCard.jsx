import { Trash2 } from "lucide-react";
import CategoryIcon from "@/components/icons/CategoryIcon";
import { categoryColor, categoryTint, money } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function TransactionCard({
  title,
  amount,
  category,
  color = "slate",
  icon,
  method,
  note,
  date,
  onDelete,
  className,
}) {
  const accent = categoryColor(color);

  return (
    <article
      className={cn(
        "group flex items-center gap-3 rounded-2xl border border-border bg-card px-3.5 py-3 shadow-card transition-colors hover:border-foreground/15",
        className
      )}
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: categoryTint(color), color: accent }}
      >
        <CategoryIcon name={icon} className="h-[17px] w-[17px]" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className="truncate text-[13.5px] font-medium tracking-[-0.01em] text-foreground">{title}</p>
          <p className="shrink-0 text-[13.5px] font-semibold text-foreground tnum">{money(amount)}</p>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {category ? (
            <span
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10.5px] font-medium"
              style={{ backgroundColor: categoryTint(color, 0.1), color: accent }}
            >
              <span className="h-1 w-1 rounded-full" style={{ backgroundColor: accent }} />
              {category}
            </span>
          ) : null}
          {method ? (
            <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10.5px] font-medium text-muted-foreground">
              {method}
            </span>
          ) : null}
          {note ? <span className="max-w-[22ch] truncate text-[10.5px] text-muted-foreground">{note}</span> : null}
          {date ? <span className="text-[10.5px] text-muted-foreground">{date}</span> : null}
        </div>
      </div>

      {onDelete ? (
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete ${title}`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </article>
  );
}