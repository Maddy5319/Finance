import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { money, moneyShort } from "@/lib/format";

function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-popover px-2.5 py-1.5 shadow-lift">
      <p className="text-[10.5px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-[12px] font-semibold text-foreground tnum">{money(payload[0].value)}</p>
    </div>
  );
}

export default function WeeklySpendChart({ days = [] }) {
  const data = days.map((day, index) => ({
    key: `${day.label}-${index}`,
    label: day.label,
    value: Number(day.value) || 0,
    isToday: Boolean(day.isToday),
  }));

  return (
    <div className="h-[210px] w-full sm:h-[230px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 6, right: 4, left: -14, bottom: 0 }} barCategoryGap="30%">
          <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="4 4" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            dy={6}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={52}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            tickFormatter={(value) => moneyShort(value)}
          />
          <Tooltip cursor={{ fill: "hsl(var(--secondary))", radius: 8 }} content={<ChartTip />} />
          <Bar dataKey="value" radius={[6, 6, 6, 6]} maxBarSize={36}>
            {data.map((entry) => (
              <Cell
                key={entry.key}
                fill={entry.isToday ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.22)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}