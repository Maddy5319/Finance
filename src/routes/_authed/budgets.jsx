import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { format, startOfMonth } from "date-fns";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import BudgetRow from "@/components/budgets/BudgetRow";
import PageHeader from "@/components/finance/PageHeader";
import MonthSwitcher from "@/components/layout/MonthSwitcher";
import Panel from "@/components/layout/Panel";
import { Skeleton } from "@/components/ui/skeleton";
import { money } from "@/lib/format";
import { loadBudgets } from "@/lib/finance";

export const Route = createFileRoute("/_authed/budgets")({
  component: BudgetsPage,
  head: () => ({ meta: [{ title: "Budgets — Budge" }] }),
});

function BudgetsPage() {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [rows, setRows] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [savingId, setSavingId] = useState(null);
  const timers = useRef({});

  const monthKey = format(month, "yyyy-MM");

  useEffect(() => {
    let alive = true;
    setRows(null);
    loadBudgets(monthKey).then(({ rows: list }) => {
      if (!alive) return;
      setRows(list);
      setDrafts(
        Object.fromEntries(
          list.map((row) => [row.category.id, row.budget ? String(row.budget.amount ?? "") : ""])
        )
      );
    });
    return () => {
      alive = false;
    };
  }, [monthKey]);

  const summary = useMemo(() => {
    const list = rows || [];
    const budgeted = list.reduce((sum, row) => sum + (Number(drafts[row.category.id]) || 0), 0);
    const spent = list.reduce((sum, row) => sum + row.spent, 0);
    return { budgeted, spent, remaining: budgeted - spent, pct: budgeted > 0 ? (spent / budgeted) * 100 : 0 };
  }, [rows, drafts]);

  async function commit(row, rawValue) {
    const amount = Math.max(0, Number(rawValue) || 0);
    const current = row.budget ? Number(row.budget.amount) || 0 : 0;
    if (row.budget ? amount === current : amount === 0) return;

    const payload = {
      category_id: row.category.id,
      category_name: row.category.name,
      color: row.category.color,
      amount,
      month: monthKey,
    };

    setSavingId(row.category.id);
    try {
      const saved = row.budget
        ? await base44.entities.Budget.update(row.budget.id, payload)
        : await base44.entities.Budget.create(payload);
      setRows((prev) =>
        (prev || []).map((item) =>
          item.category.id === row.category.id ? { ...item, budget: saved || { ...payload, id: row.budget?.id } } : item
        )
      );
      toast.success(amount > 0 ? `Limit set for ${row.category.name}` : `Limit cleared for ${row.category.name}`);
    } catch (err) {
      toast.error(err?.message || "Could not save this limit");
    } finally {
      setSavingId(null);
    }
  }

  function handleChange(row, value) {
    const id = row.category.id;
    setDrafts((draft) => ({ ...draft, [id]: value }));
    clearTimeout(timers.current[id]);
    timers.current[id] = setTimeout(() => commit(row, value), 700);
  }

  function handleBlur(row, value) {
    clearTimeout(timers.current[row.category.id]);
    commit(row, value);
  }

  return (
    <div className="animate-rise space-y-4 sm:space-y-5">
      <PageHeader
        eyebrow="Plan"
        title="Budgets"
        description="Set a monthly limit per category and watch each one fill up as you spend."
        actions={<MonthSwitcher month={month} onChange={setMonth} />}
      />

      {rows === null ? (
        <div className="space-y-4">
          <Skeleton className="h-[168px] rounded-2xl" />
          <Skeleton className="h-[340px] rounded-2xl" />
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-card sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {format(month, "MMMM yyyy")} plan
                </p>
                <p className="mt-2 text-[1.65rem] font-semibold leading-none tracking-[-0.03em] text-foreground tnum sm:text-[2rem]">
                  {money(summary.spent)}
                  <span className="ml-1.5 text-[13px] font-medium text-muted-foreground">
                    of {money(summary.budgeted)}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {summary.remaining < 0 ? "Over budget" : "Remaining"}
                </p>
                <p
                  className="mt-2 text-[13px] font-semibold tnum"
                  style={{ color: summary.remaining < 0 ? "hsl(var(--destructive))" : "hsl(var(--success))" }}
                >
                  {money(Math.abs(summary.remaining))}
                </p>
              </div>
            </div>

            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full transition-[width] duration-700"
                style={{
                  width: `${Math.min(Math.max(summary.pct, summary.spent > 0 ? 2 : 0), 100)}%`,
                  backgroundColor:
                    summary.budgeted > 0 && summary.spent > summary.budgeted
                      ? "hsl(var(--destructive))"
                      : "hsl(var(--primary))",
                }}
              />
            </div>
            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11.5px] text-muted-foreground">
                {summary.budgeted > 0
                  ? `${Math.round(summary.pct)}% of your ${format(month, "MMMM")} plan used`
                  : "No limits set yet — enter one beside any category below."}
              </p>
              <p className="text-[11.5px] font-medium text-foreground tnum">
                {rows.filter((row) => Number(drafts[row.category.id]) > 0).length} of {rows.length} categories limited
              </p>
            </div>
          </div>

          <Panel title="Limits by category" subtitle="Type a limit — it saves automatically">
            <div className="divide-y divide-border/70">
              {rows.map((row) => (
                <BudgetRow
                  key={row.category.id}
                  row={row}
                  value={drafts[row.category.id] ?? ""}
                  onChange={(value) => handleChange(row, value)}
                  onCommit={(value) => handleBlur(row, value)}
                  saving={savingId === row.category.id}
                />
              ))}
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}