import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { format, startOfMonth } from "date-fns";
import {
  ArrowUpRight,
  Banknote,
  CreditCard,
  Landmark,
  Plus,
  Receipt,
  Smartphone,
  Tags,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import InsightsPreview from "@/components/dashboard/InsightsPreview";
import KpiTile from "@/components/finance/KpiTile";
import PageHeader from "@/components/finance/PageHeader";
import Panel from "@/components/layout/Panel";
import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORY_COLORS, categoryColor, money, moneyShort } from "@/lib/format";
import { loadInsights, methodLabel } from "@/lib/finance";

export const Route = createFileRoute("/_authed/insights")({
  component: InsightsPage,
  head: () => ({ meta: [{ title: "Insights — Budge" }] }),
});

const FALLBACK = Object.values(CATEGORY_COLORS);

const METHOD_META = {
  upi: { color: "#3D6BF5", icon: Smartphone },
  card: { color: "#7C5CD6", icon: CreditCard },
  cash: { color: "#D68A13", icon: Banknote },
  bank_transfer: { color: "#11946B", icon: Landmark },
  other: { color: "#647089", icon: Wallet },
};

function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-popover px-2.5 py-1.5 shadow-lift">
      <p className="text-[10.5px] text-muted-foreground">{label ?? payload[0]?.name}</p>
      <p className="mt-0.5 text-[12px] font-semibold text-foreground tnum">{money(payload[0].value)}</p>
    </div>
  );
}

function InsightsPage() {
  const [data, setData] = useState(null);
  const monthName = format(startOfMonth(new Date()), "MMMM");

  useEffect(() => {
    let alive = true;
    loadInsights().then((insights) => {
      if (!alive) return;
      setData(insights);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (!data) {
    return (
      <div className="animate-rise space-y-4">
        <Skeleton className="h-16 w-[280px] rounded-xl" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Skeleton className="h-[112px] rounded-2xl" />
          <Skeleton className="h-[112px] rounded-2xl" />
          <Skeleton className="h-[112px] rounded-2xl" />
          <Skeleton className="h-[112px] rounded-2xl" />
        </div>
        <Skeleton className="h-[300px] rounded-2xl" />
      </div>
    );
  }

  const top = data.categories[0];
  const pieData = data.categories.slice(0, 6);
  const palette = data.categoryColors ?? new Map();
  const colorFor = (name, index) => categoryColor(palette.get(name) || FALLBACK[index % FALLBACK.length]);
  const methodTotal = data.methods.reduce((sum, item) => sum + item.total, 0) || 1;

  return (
    <div className="animate-rise space-y-4 sm:space-y-5">
      <PageHeader
        eyebrow="Read the numbers"
        title="Insights"
        description={`Patterns across the last six months, with ${monthName} broken down by category and payment method.`}
        actions={
          data.hasData ? (
            <Link
              to="/budgets"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-[12px] font-semibold text-foreground shadow-card transition-colors hover:bg-secondary"
            >
              Review budgets <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <Link
              to="/expenses/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-[12.5px] font-semibold text-primary-foreground shadow-card"
            >
              <Plus className="h-4 w-4" strokeWidth={2.4} /> Add expense
            </Link>
          )
        }
      />

      {!data.hasData ? (
        <InsightsPreview />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <KpiTile
              label="Average per day"
              amount={data.avgPerDay}
              hint={`${monthName} so far`}
              icon={TrendingUp}
              accent="#3D6BF5"
            />
            <KpiTile
              label="Entries this month"
              text={String(data.monthCount)}
              hint={`${money(data.monthTotal)} logged`}
              icon={Receipt}
              accent="#11946B"
            />
            <KpiTile
              label="Largest expense"
              text={data.largest ? money(data.largest.amount) : "—"}
              hint={data.largest ? data.largest.title : "Nothing yet"}
              icon={Wallet}
              accent="#D68A13"
            />
            <KpiTile
              label="Top category"
              text={top ? top.name : "—"}
              hint={top ? `${money(top.total)} this month` : "No spending yet"}
              icon={Tags}
              accent="#7C5CD6"
            />
          </div>

          <Panel title="Six-month trend" subtitle="Total spending per month">
            <div className="h-[240px] w-full sm:h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.months} margin={{ top: 6, right: 4, left: -14, bottom: 0 }} barCategoryGap="32%">
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
                    width={56}
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(value) => moneyShort(value)}
                  />
                  <Tooltip cursor={{ fill: "hsl(var(--secondary))", radius: 8 }} content={<ChartTip />} />
                  <Bar dataKey="total" radius={[6, 6, 6, 6]} maxBarSize={44}>
                    {data.months.map((month, index) => (
                      <Cell
                        key={month.key}
                        fill={index === data.months.length - 1 ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.24)"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <div className="grid gap-3 lg:grid-cols-5 sm:gap-4">
            <Panel className="lg:col-span-3" title="By category" subtitle={`${monthName} split`}>
              {pieData.length === 0 ? (
                <p className="py-10 text-center text-[12.5px] text-muted-foreground">
                  No spending logged this month yet.
                </p>
              ) : (
                <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-6">
                  <div className="h-[184px] w-[184px] shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="total"
                          nameKey="name"
                          innerRadius={54}
                          outerRadius={84}
                          paddingAngle={2}
                          stroke="none"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={entry.name} fill={colorFor(entry.name, index)} />
                          ))}
                        </Pie>
                        <Tooltip content={<ChartTip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <ul className="w-full space-y-2.5">
                    {pieData.map((entry, index) => {
                      const pct = Math.round((entry.total / (data.monthTotal || 1)) * 100);
                      return (
                        <li key={entry.name} className="flex items-center gap-2.5">
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: colorFor(entry.name, index) }}
                          />
                          <span className="min-w-0 flex-1 truncate text-[12.5px] text-foreground">{entry.name}</span>
                          <span className="shrink-0 text-[11px] text-muted-foreground tnum">{pct}%</span>
                          <span className="w-[68px] shrink-0 text-right text-[12px] font-medium text-foreground tnum">
                            {money(entry.total)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </Panel>

            <Panel className="lg:col-span-2" title="How you paid" subtitle={monthName}>
              {data.methods.length === 0 ? (
                <p className="py-10 text-center text-[12.5px] text-muted-foreground">Nothing to show yet.</p>
              ) : (
                <ul className="space-y-3.5">
                  {data.methods.map((method) => {
                    const meta = METHOD_META[method.method] || METHOD_META.other;
                    const Icon = meta.icon;
                    const pct = Math.round((method.total / methodTotal) * 100);
                    return (
                      <li key={method.method}>
                        <div className="flex items-center gap-2.5">
                          <span
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                            style={{ backgroundColor: `${meta.color}14`, color: meta.color }}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                          <span className="min-w-0 flex-1 text-[12.5px] text-foreground">
                            {methodLabel(method.method)}
                          </span>
                          <span className="shrink-0 text-[11px] text-muted-foreground tnum">{pct}%</span>
                          <span className="w-[64px] shrink-0 text-right text-[12px] font-medium text-foreground tnum">
                            {money(method.total)}
                          </span>
                        </div>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full transition-[width] duration-700"
                            style={{ width: `${Math.max(pct, 3)}%`, backgroundColor: meta.color }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}