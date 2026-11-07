import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import CategoryIcon from "@/components/icons/CategoryIcon";
import PageHeader from "@/components/finance/PageHeader";
import { CURRENCY_SYMBOL, categoryColor, categoryTint, dateKey, money } from "@/lib/format";
import { PAYMENT_METHODS, loadCategories } from "@/lib/finance";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/expenses/new")({
  component: AddExpensePage,
  head: () => ({ meta: [{ title: "Add expense — Budge" }] }),
});

const fieldClass =
  "h-10 w-full rounded-xl border border-border bg-background px-3 text-[13px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/50 focus:ring-2 focus:ring-primary/10";

const labelClass = "mb-1.5 block text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground";

function AddExpensePage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    amount: "",
    title: "",
    category_id: "",
    date: dateKey(new Date()),
    payment_method: "upi",
    note: "",
  });

  useEffect(() => {
    let alive = true;
    loadCategories().then((list) => {
      if (!alive) return;
      setCategories(list);
      setForm((current) => (current.category_id ? current : { ...current, category_id: list[0]?.id || "" }));
    });
    return () => {
      alive = false;
    };
  }, []);

  const selected = useMemo(
    () => categories.find((category) => category.id === form.category_id) || null,
    [categories, form.category_id]
  );

  function update(patch) {
    setError("");
    setForm((current) => ({ ...current, ...patch }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    if (!form.title.trim()) {
      setError("Give this expense a short name.");
      return;
    }
    if (!selected) {
      setError("Pick a category first.");
      return;
    }

    setSaving(true);
    try {
      await base44.entities.Expense.create({
        title: form.title.trim(),
        amount,
        category_id: selected.id,
        category_name: selected.name,
        color: selected.color,
        date: form.date,
        payment_method: form.payment_method,
        note: form.note.trim(),
      });
      toast.success(`${money(amount)} logged to ${selected.name}`);
      navigate({ to: "/expenses" });
    } catch (err) {
      setError(err?.message || "Could not save this expense. Try again.");
      setSaving(false);
    }
  }

  return (
    <div className="animate-rise mx-auto max-w-[680px] space-y-4 sm:space-y-5">
      <button
        type="button"
        onClick={() => navigate({ to: "/expenses" })}
        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11.5px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to expenses
      </button>

      <PageHeader
        eyebrow={format(new Date(`${form.date}T00:00:00`), "EEEE, d MMMM yyyy")}
        title="Add expense"
        description="One entry takes a few seconds — it lands in your daily, weekly and monthly totals straight away."
      />

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-border bg-card p-4 shadow-card sm:p-6">
        <div>
          <label className={labelClass} htmlFor="amount">
            Amount
          </label>
          <div className="flex items-center gap-1 rounded-xl border border-border bg-background px-4 py-3 transition-colors focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10">
            <span className="text-[1.35rem] font-medium leading-none text-muted-foreground">{CURRENCY_SYMBOL}</span>
            <input
              id="amount"
              value={form.amount}
              onChange={(event) => update({ amount: event.target.value.replace(/[^\d.]/g, "") })}
              inputMode="decimal"
              placeholder="0"
              className="w-full bg-transparent text-[1.7rem] font-semibold leading-none tracking-[-0.03em] text-foreground outline-none placeholder:text-muted-foreground/35 tnum"
            />
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="title">
            What was it for?
          </label>
          <input
            id="title"
            value={form.title}
            onChange={(event) => update({ title: event.target.value })}
            placeholder="Dinner with friends, metro card, chemist…"
            className={fieldClass}
          />
        </div>

        <div>
          <label className={labelClass}>Category</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {categories.map((category) => {
              const active = category.id === form.category_id;
              const accent = categoryColor(category.color);
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => update({ category_id: category.id })}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-2.5 py-2 text-left text-[12px] font-medium transition-all",
                    active
                      ? "border-transparent text-background"
                      : "border-border bg-background text-foreground hover:border-foreground/20"
                  )}
                  style={active ? { backgroundColor: accent, color: "#ffffff" } : undefined}
                >
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg"
                    style={
                      active
                        ? { backgroundColor: "rgba(255,255,255,0.2)", color: "#fff" }
                        : { backgroundColor: categoryTint(category.color), color: accent }
                    }
                  >
                    <CategoryIcon name={category.icon} className="h-3.5 w-3.5" />
                  </span>
                  <span className="truncate">{category.name}</span>
                </button>
              );
            })}
          </div>
          {categories.length === 0 ? (
            <p className="mt-2 text-[11.5px] text-muted-foreground">Setting up your categories…</p>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="date">
              Date
            </label>
            <input
              id="date"
              type="date"
              value={form.date}
              onChange={(event) => update({ date: event.target.value })}
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass}>Paid with</label>
            <div className="flex flex-wrap gap-1.5">
              {PAYMENT_METHODS.map((method) => {
                const active = method.value === form.payment_method;
                return (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => update({ payment_method: method.value })}
                    className={cn(
                      "rounded-lg border px-2.5 py-2 text-[11.5px] font-medium transition-colors",
                      active
                        ? "border-transparent bg-foreground text-background"
                        : "border-border bg-background text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {method.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="note">
            Note <span className="font-normal normal-case tracking-normal text-muted-foreground/80">(optional)</span>
          </label>
          <textarea
            id="note"
            value={form.note}
            onChange={(event) => update({ note: event.target.value })}
            rows={3}
            placeholder="Anything worth remembering about this one"
            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-[13px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
          />
        </div>

        {error ? (
          <p className="rounded-xl bg-destructive/8 px-3 py-2.5 text-[12px] font-medium text-destructive">{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          <Check className="h-4 w-4" strokeWidth={2.4} />
          {saving ? "Saving…" : "Save expense"}
        </button>
      </form>
    </div>
  );
}