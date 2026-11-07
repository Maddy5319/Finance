import { useEffect, useState } from "react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import CategoryIcon, { ICON_KEYS } from "@/components/icons/CategoryIcon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CATEGORY_COLOR_KEYS, categoryColor } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function CategoryForm({ open, onOpenChange, category, onSaved }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("slate");
  const [icon, setIcon] = useState("circle");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(category?.name || "");
    setColor(category?.color || "slate");
    setIcon(category?.icon || "circle");
  }, [open, category]);

  async function handleSave(event) {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const payload = { name: name.trim(), color, icon };
    try {
      const saved = category
        ? await base44.entities.Category.update(category.id, payload)
        : await base44.entities.Category.create(payload);
      toast.success(category ? "Category updated" : "Category added");
      onSaved?.(saved || { ...payload, id: category?.id });
      onOpenChange(false);
    } catch (err) {
      toast.error(err?.message || "Could not save the category");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-[1.15rem] font-semibold tracking-[-0.01em]">
            {category ? "Edit category" : "New category"}
          </DialogTitle>
          <DialogDescription className="text-[12.5px]">
            Categories group your spending on the dashboard, budgets and insights.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-5 pt-1">
          <div>
            <label className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Coffee, books, gifts…"
              className="h-10 rounded-xl text-[13px]"
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Colour
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_COLOR_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setColor(key)}
                  aria-label={key}
                  className={cn(
                    "h-7 w-7 rounded-full transition-transform",
                    color === key ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "hover:scale-105"
                  )}
                  style={{ backgroundColor: categoryColor(key) }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Icon
            </label>
            <div className="grid grid-cols-10 gap-1.5">
              {ICON_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setIcon(key)}
                  aria-label={key}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg border transition-colors",
                    icon === key
                      ? "border-transparent bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  <CategoryIcon name={key} className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !name.trim()} className="rounded-xl">
              {saving ? "Saving…" : category ? "Save changes" : "Add category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}