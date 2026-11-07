import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { format, startOfMonth } from "date-fns";
import { Plus, Search, X } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import TransactionCard from "@/components/finance/TransactionCard";
import PageHeader from "@/components/finance/PageHeader";
import CategoryIcon from "@/components/icons/CategoryIcon";
import MonthSwitcher from "@/components/layout/MonthSwitcher";
import { Skeleton } from "@/components/ui/skeleton";
import { categoryColor, categoryTint, money } from "@/lib/format";
import { loadCategories, loadExpenses, methodLabel } from "@/lib/finance";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/expenses/")({
  component: ExpensesPage,
  head: () => ({ meta: [{ title: "Expenses — Budge" }] }),
});

function ExpensesPage() {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [items, setItems] = useState(null);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    let alive = true;
    loadCategories().then((list) => {
      if (alive) setCategories(list);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    setItems(null);
    loadExpenses(format(month, "yyyy-MM")).then((list) => {
      if (alive) setItems(list);
    });
    return () => {
      alive = false;
    };
  }, [month]);

  const iconById = useMemo(() => new Map(categories.map((c) => [c.id, c.icon])), [categories]);

  const filtered = useMemo(() => {
    const list = items || [];
    const term = search.trim().toLowerCase();
    return list.filter((expense) => {
      const matchesTerm = !term || expense.title.toLowerCase().includes(term);
      const matchesCategory = activeCategory === "all" || expense.category_id === activeCategory;
      return matchesTerm && matchesCategory;
    });
  }, [items, search, activeCategory]);

  const total = filtered.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);

  const groups = useMemo(() => {
    const map = new Map();
    filtered.forEach((expense) => {
      if (!map.has(expense.date)) map.set(expense.date, []);
      map.get(expense.date).push(expense);
    });
    return Array.from(map.entries());
  }, [filtered]);

  async function handleDelete(id) {
    await base44.entities.Expense.delete(id);
    setItems((prev) => (prev || []).filter((expense) => expense.id !== id));
    toast.success("Expense deleted");
  }

  return (
    <div className="animate-rise space-y-4 sm:space-y-5">
      <PageHeader
        eyebrow="Ledger"
        title="Expenses"
        description={
          items === null
            ? "Loading your entries…"
            : `${filtered.length} ${filtered.length === 1 ? "entry" : "entries"} · ${money(total)} in ${format(month, "MMMM yyyy")}`
        }
        actions={
          <>
            <MonthSwitcher month={month} onChange={setMonth} />
            <Link
              to="/expenses/new"
              className="hidden items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-[12.5px] font-semibold text-primary-foreground shadow-card transition-opacity hover:opacity-90 sm:inline-flex"
            >
              <Plus className="h-4 w-4" strokeWidth={2.4} /> Add expense
            </Link>
          </>
        }
      />

      <div className="space-y-2.5 rounded-2xl border border-border bg-card p-3 shadow-card sm:p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search this month's expenses"
            className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-9 text-[13px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>

        <div className="hide-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={cn(
              "shrink-0 rounded-lg border px-2.5 py-1.5 text-[11.5px] font-medium transition-colors",
              activeCategory === "all"
                ? "border-transparent bg-foreground text-background"
                : "border-border bg-background text-muted-foreground hover:text-foreground"
            )}
          >
            All
          </button>
          {categories.map((category) => {
            const active = activeCategory === category.id;
            const accent = categoryColor(category.color);
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11.5px] font-medium transition-colors",
                  active ? "border-transparent text-background" : "border-border bg-background text-muted-foreground hover:text-foreground"
                )}
                style={active ? { backgroundColor: accent, color: "#ffffff" } : undefined}
              >
                <span
                  className="flex h-4 w-4 items-center justify-center rounded"
                  style={active ? { color: "#fff" } : { backgroundColor: categoryTint(category.color), color: accent }}
                >
                  <CategoryIcon name={category.icon} className="h-2.5 w-2.5" />
                </span>
                {category.name}
              </button>
            );
          })}
        </div>
      </div>

      {items === null ? (
        <div className="space-y-2">
          <Skeleton className="h-[68px] w-full rounded-2xl" />
          <Skeleton className="h-[68px] w-full rounded-2xl" />
          <Skeleton className="h-[68px] w-full rounded-2xl" />
        </div>
      ) : groups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-14 text-center">
          <p className="text-[13.5px] font-semibold text-foreground">Nothing here for {format(month, "MMMM")}</p>
          <p className="mx-auto mt-1.5 max-w-[36ch] text-[12px] leading-relaxed text-muted-foreground">
            {search || activeCategory !== "all"
              ? "No expenses match these filters. Try clearing the search or picking another category."
              : "Log your first expense and it will appear in this ledger."}
          </p>
          <Link
            to="/expenses/new"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-[12.5px] font-semibold text-primary-foreground"
          >
            <Plus className="h-4 w-4" strokeWidth={2.4} /> Add expense
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {groups.map(([date, list]) => {
            const dayTotal = list.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
            return (
              <section key={date}>
                <div className="mb-2 flex items-baseline justify-between gap-3 px-1">
                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {format(new Date(`${date}T00:00:00`), "EEE, d MMM")}
                  </h2>
                  <span className="text-[11.5px] font-medium text-muted-foreground tnum">
                    {list.length} {list.length === 1 ? "entry" : "entries"} · {money(dayTotal)}
                  </span>
                </div>
                <div className="space-y-2">
                  {list.map((expense) => (
                    <TransactionCard
                      key={expense.id}
                      title={expense.title}
                      amount={expense.amount}
                      category={expense.category_name || "Uncategorised"}
                      color={expense.color}
                      icon={iconById.get(expense.category_id)}
                      method={methodLabel(expense.payment_method)}
                      note={expense.note}
                      onDelete={() => handleDelete(expense.id)}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

    </div>
  );
}