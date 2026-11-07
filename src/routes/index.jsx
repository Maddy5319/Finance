import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { ArrowUpRight, CalendarDays, CalendarRange, Coins, PieChart, Plus } from "lucide-react";
import CategorySplit from "@/components/dashboard/CategorySplit";
import FeedbackNote from "@/components/dashboard/FeedbackNote";
import RecentActivity from "@/components/dashboard/RecentActivity";
import WeeklySpendChart from "@/components/dashboard/WeeklySpendChart";
import KpiTile from "@/components/finance/KpiTile";
import PageHeader from "@/components/finance/PageHeader";
import Panel from "@/components/layout/Panel";
import { Skeleton } from "@/components/ui/skeleton";
import { money } from "@/lib/format";
import { loadDashboard } from "@/lib/finance";

export const Route = createFileRoute("/")({
  component: DashboardPage,
  head: () => ({ meta: [{ title: "Dashboard — Budge" }] }),
});

function Greeting() {
  const hour = new Date().getHours();
  const part = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return part;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-16 w-[280px] rounded-xl" />
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Skeleton className="h-[112px] rounded-2xl" />
        <Skeleton className="h-[112px] rounded-2xl" />
        <Skeleton className="h-[112px] rounded-2xl" />
        <Skeleton className="h-[112px] rounded-2xl" />
      </div>
      <Skeleton className="h-[300px] rounded-2xl" />
    </div>
  );
}

function DashboardPage() {
  const [data, setData] = useState(null);
  const today = new Date();

  useEffect(() => {
    let alive = true;
    loadDashboard().then((next) => {
      if (alive) setData(next);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (!data) {
    return (
      <div className="animate-rise">
        <DashboardSkeleton />
      </div>
    );
  }

  const top = data.categories[0];
  const weekAvg = data.weekDays.length ? data.week / data.weekDays.length : 0;

  return (
    <div className="animate-rise space-y-4 sm:space-y-5">
      <PageHeader
        eyebrow={format(today, "EEEE, d MMMM yyyy")}
        title={<Greeting />}
        description="Your spending picture for today, this week and this month — all in one place."
        actions={
          <Link
            to="/expenses/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-[12.5px] font-semibold text-primary-foreground shadow-card transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" strokeWidth={2.4} /> Add expense
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <KpiTile
          label="Spent today"
          amount={data.today}
          delta={data.todayChange}
          hint="vs yesterday"
          icon={Coins}
          accent="#3D6BF5"
        />
        <KpiTile
          label="This week"
          amount={data.week}
          delta={data.weekChange}
          hint="vs last week"
          icon={CalendarRange}
          accent="#11946B"
        />
        <KpiTile
          label={`${data.monthLabel} so far`}
          amount={data.month}
          delta={data.monthChange}
          hint="vs last month"
          icon={CalendarDays}
          accent="#D68A13"
        />
        <KpiTile
          label="Top category"
          text={top ? top.name : "—"}
          hint={top ? `${money(top.total)} this month` : "No spending yet"}
          icon={PieChart}
          accent="#7C5CD6"
        />
      </div>

      <FeedbackNote {...data.feedback} />

      <div className="grid gap-3 lg:grid-cols-3 sm:gap-4">
        <Panel
          className="lg:col-span-2"
          title="Weekly spending"
          subtitle={`${money(data.week)} this week · ${money(weekAvg)} average per day`}
          action={
            <Link
              to="/insights"
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11.5px] font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              Insights <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          <WeeklySpendChart days={data.weekDays} />
        </Panel>

        <Panel title="Where it went" subtitle={`${data.monthLabel} by category`}>
          <CategorySplit items={data.categories} />
        </Panel>
      </div>

      <Panel
        title="Recent transactions"
        subtitle="Your five latest entries"
        action={
          <Link
            to="/expenses"
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11.5px] font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        }
        bodyClassName="p-3 sm:p-4"
      >
        <RecentActivity
          items={data.recent}
          emptyHint="Nothing logged yet — your first expense will show up here."
        />
      </Panel>
    </div>
  );
}