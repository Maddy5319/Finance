import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Receipt,
  Plus,
  Tags,
  Target,
  LineChart,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/expenses", label: "Expenses", icon: Receipt },
  { to: "/categories", label: "Categories", icon: Tags },
  { to: "/budgets", label: "Budgets", icon: Target },
  { to: "/insights", label: "Insights", icon: LineChart },
];

function isActive(pathname, item) {
  if (item.exact) return pathname === "/";
  return pathname === item.to || pathname.startsWith(`${item.to}/`);
}

export default function AppShell({ children }) {
  const pathname = useLocation().pathname;

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop rail */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-border bg-card px-4 py-6 lg:flex">
        <Link to="/" className="mb-7 flex items-center gap-2.5 px-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Wallet className="h-[18px] w-[18px]" strokeWidth={2} />
          </span>
          <span className="leading-tight">
            <span className="block text-[1.05rem] font-semibold leading-none tracking-[-0.02em] text-foreground">
              Budge
            </span>
            <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Expense tracker
            </span>
          </span>
        </Link>

        <Link
          to="/expenses/new"
          className="mb-5 inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-[12.5px] font-semibold text-primary-foreground shadow-card transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" strokeWidth={2.4} /> Add expense
        </Link>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-colors",
                  active
                    ? "bg-accent font-semibold text-accent-foreground"
                    : "font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="h-[17px] w-[17px] shrink-0" strokeWidth={active ? 2.2 : 1.9} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur-xl lg:hidden">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Wallet className="h-4 w-4" strokeWidth={2} />
          </span>
          <span className="text-[0.95rem] font-semibold tracking-[-0.02em]">Budge</span>
        </Link>
      </header>

      <main className="px-4 pb-28 pt-5 sm:px-6 lg:ml-[248px] lg:px-10 lg:pb-14 lg:pt-10">
        <div className="mx-auto w-full max-w-[1120px]">{children}</div>
      </main>

      {/* Mobile add shortcut */}
      <Link
        to="/expenses/new"
        aria-label="Add expense"
        className="fixed bottom-[84px] right-4 z-40 flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lift transition-transform active:scale-95 lg:hidden"
      >
        <Plus className="h-5 w-5" strokeWidth={2.5} />
      </Link>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur-xl lg:hidden">
        <div className="flex items-stretch justify-between px-1 pb-[env(safe-area-inset-bottom)]">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 py-2.5 text-[9.5px] tracking-[0.01em] transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-[19px] w-[19px]" strokeWidth={active ? 2.3 : 1.8} />
                <span className={active ? "font-semibold" : "font-medium"}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}