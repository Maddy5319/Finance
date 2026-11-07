import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import CategoryIcon from "@/components/icons/CategoryIcon";
import { categoryColor, categoryTint, money } from "@/lib/format";

function SliceTip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-xl border border-border bg-popover px-2.5 py-1.5 shadow-lift">
      <p className="text-[10.5px] text-muted-foreground">{item.name}</p>
      <p className="mt-0.5 text-[12px] font-semibold text-foreground tnum">{money(item.total)}</p>
    </div>
  );
}

export default function CategorySplit({ items = [] }) {
  if (!items.length) {
    return (
      <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center">
        <p className="text-[12.5px] text-muted-foreground">Categories appear once you log an expense.</p>
      </div>
    );
  }

  const total = items.reduce((sum, item) => sum + (Number(item.total) || 0), 0) || 1;

  return (
    <div>
      <div className="relative mx-auto h-[168px] w-[168px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={items}
              dataKey="total"
              nameKey="name"
              innerRadius={54}
              outerRadius={80}
              paddingAngle={2}
              stroke="none"
            >
              {items.map((item) => (
                <Cell key={item.name} fill={categoryColor(item.color)} />
              ))}
            </Pie>
            <Tooltip content={<SliceTip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Total</span>
          <span className="mt-1 text-[15px] font-semibold tracking-[-0.02em] text-foreground tnum">
            {money(total)}
          </span>
        </div>
      </div>

      <ul className="mt-4 space-y-2.5">
        {items.map((item) => {
          const pct = Math.round(((Number(item.total) || 0) / total) * 100);
          return (
            <li key={item.name} className="flex items-center gap-2.5">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: categoryTint(item.color), color: categoryColor(item.color) }}
              >
                <CategoryIcon name={item.icon} className="h-3.5 w-3.5" />
              </span>
              <span className="min-w-0 flex-1 truncate text-[12.5px] text-foreground">{item.name}</span>
              <span className="shrink-0 text-[11px] text-muted-foreground tnum">{pct}%</span>
              <span className="w-[68px] shrink-0 text-right text-[12px] font-medium text-foreground tnum">
                {money(item.total)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}