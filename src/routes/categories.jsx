import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { format, startOfMonth } from "date-fns";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import CategoryForm from "@/components/categories/CategoryForm";
import CategoryIcon from "@/components/icons/CategoryIcon";
import PageHeader from "@/components/finance/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { categoryColor, categoryTint, dateKey, money, monthRange } from "@/lib/format";
import { invalidateCategories, loadCategories } from "@/lib/finance";

export const Route = createFileRoute("/categories")({
  component: CategoriesPage,
  head: () => ({ meta: [{ title: "Categories — Budge" }] }),
});

function CategoriesPage() {
  const [categories, setCategories] = useState(null);
  const [stats, setStats] = useState(new Map());
  const [editor, setEditor] = useState({ open: false, category: null });
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    let alive = true;
    const { start, end } = monthRange(new Date());
    Promise.all([
      loadCategories(),
      base44.entities.Expense.aggregate({
        query: { date: { $gte: dateKey(start), $lte: dateKey(end) } },
        groupBy: "category_id",
        sum: ["amount"],
      }),
    ]).then(([list, agg]) => {
      if (!alive) return;
      setCategories(list);
      setStats(
        new Map(
          ((agg?.rows ?? []) || []).map((row) => [
            row.category_id,
            { total: Number(row.sum_amount) || 0, count: row.count || 0 },
          ])
        )
      );
    });
    return () => {
      alive = false;
    };
  }, []);

  function handleSaved(saved) {
    invalidateCategories();
    setCategories((prev) => {
      const list = prev || [];
      const exists = list.some((category) => category.id === saved.id);
      return exists ? list.map((category) => (category.id === saved.id ? { ...category, ...saved } : category)) : [...list, saved];
    });
  }

  async function handleDelete() {
    const target = pendingDelete;
    setPendingDelete(null);
    if (!target) return;
    await base44.entities.Category.delete(target.id);
    invalidateCategories();
    setCategories((prev) => (prev || []).filter((category) => category.id !== target.id));
    toast.success(`${target.name} deleted`);
  }

  const monthName = format(startOfMonth(new Date()), "MMMM");

  return (
    <div className="animate-rise space-y-4 sm:space-y-5">
      <PageHeader
        eyebrow="Organise"
        title="Categories"
        description={`Every expense lands in one of these buckets. Totals below are for ${monthName}.`}
        actions={
          <button
            type="button"
            onClick={() => setEditor({ open: true, category: null })}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-[12.5px] font-semibold text-primary-foreground shadow-card transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" strokeWidth={2.4} /> New category
          </button>
        }
      />

      {categories === null ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-[124px] rounded-2xl" />
          <Skeleton className="h-[124px] rounded-2xl" />
          <Skeleton className="h-[124px] rounded-2xl" />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const accent = categoryColor(category.color);
            const stat = stats.get(category.id);
            return (
              <article
                key={category.id}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-card transition-shadow hover:shadow-lift"
              >
                <span className="absolute inset-x-0 top-0 h-[3px]" style={{ backgroundColor: accent }} />
                <div className="flex items-start justify-between gap-2">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: categoryTint(category.color), color: accent }}
                  >
                    <CategoryIcon name={category.icon} className="h-[18px] w-[18px]" />
                  </span>
                  <div className="flex gap-1 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => setEditor({ open: true, category })}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      aria-label={`Edit ${category.name}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(category)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Delete ${category.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <p className="mt-3 truncate text-[13.5px] font-semibold tracking-[-0.01em] text-foreground">
                  {category.name}
                </p>
                <div className="mt-1 flex items-baseline justify-between gap-2">
                  <p className="text-[15px] font-semibold text-foreground tnum">
                    {stat ? money(stat.total) : money(0)}
                  </p>
                  <p className="text-[10.5px] text-muted-foreground">
                    {stat ? `${stat.count} ${stat.count === 1 ? "entry" : "entries"}` : "No spending"}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <CategoryForm
        open={editor.open}
        onOpenChange={(open) => setEditor((current) => ({ ...current, open }))}
        category={editor.category}
        onSaved={handleSaved}
      />

      <AlertDialog open={Boolean(pendingDelete)} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {pendingDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              The category is removed from this list. Expenses already logged keep their category name, but new
              expenses can't use it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Keep it</AlertDialogCancel>
            <AlertDialogAction className="rounded-xl" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}