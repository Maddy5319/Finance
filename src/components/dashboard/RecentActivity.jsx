import TransactionCard from "@/components/finance/TransactionCard";
import { relativeDay } from "@/lib/format";

export default function RecentActivity({ items = [], emptyHint }) {
  if (!items.length) {
    return (
      <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center">
        <p className="text-[12.5px] text-muted-foreground">{emptyHint || "No expenses logged yet."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <TransactionCard
          key={item.id}
          title={item.title}
          amount={item.amount}
          category={item.category}
          color={item.color}
          icon={item.icon}
          date={relativeDay(item.date)}
        />
      ))}
    </div>
  );
}