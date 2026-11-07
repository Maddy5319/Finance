import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function KpiTile({
  label,
  amount,
  text,
  prefix = "₹",
  decimals = 0,
  hint,
  delta,
  icon: Icon,
  accent = "#3D6BF5",
}) {
  const hasAmount = amount !== undefined && amount !== null;
  const hasDelta = Number.isFinite(delta);
  const flat = hasDelta && Math.abs(delta) < 0.05;
  const good = hasDelta && delta < 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
        {Icon ? (
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${accent}14`, color: accent }}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={2} />
          </span>
        ) : null}
      </div>

      <p className="mt-3 truncate text-[1.5rem] font-semibold leading-none tracking-[-0.03em] text-foreground tnum sm:text-[1.7rem]">
        {hasAmount ? (
          <>
            <span className="mr-0.5 text-[1rem] font-medium text-muted-foreground">{prefix}</span>
            {formatMoney(amount, { decimals })}
          </>
        ) : (
          <span className="text-[1.15rem] sm:text-[1.3rem]">{text || "—"}</span>
        )}
      </p>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1">
        {hasDelta ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold tnum",
              flat
                ? "bg-secondary text-muted-foreground"
                : good
                  ? "bg-success/10 text-success"
                  : "bg-destructive/10 text-destructive"
            )}
          >
            {flat ? null : delta > 0 ? (
              <ArrowUpRight className="h-3 w-3" strokeWidth={2.4} />
            ) : (
              <ArrowDownRight className="h-3 w-3" strokeWidth={2.4} />
            )}
            {Math.abs(delta).toFixed(1)}%
          </span>
        ) : null}
        {hint ? <span className="truncate text-[11px] text-muted-foreground">{hint}</span> : null}
      </div>
    </div>
  );
}