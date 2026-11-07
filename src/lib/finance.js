import { base44 } from "@/api/base44Client";
import { addDays, endOfMonth, format, startOfMonth, subDays, subMonths } from "date-fns";
import { dateKey, monthRange, weekRange } from "@/lib/format";

export const DEFAULT_CATEGORIES = [
  { name: "Food & dining", color: "amber", icon: "utensils" },
  { name: "Groceries", color: "emerald", icon: "basket" },
  { name: "Transport", color: "indigo", icon: "bus" },
  { name: "Rent & bills", color: "violet", icon: "home" },
  { name: "Shopping", color: "rose", icon: "bag" },
  { name: "Health", color: "teal", icon: "heart" },
  { name: "Fun & leisure", color: "orange", icon: "clapper" },
  { name: "Other", color: "slate", icon: "circle" },
];

export const PAYMENT_METHODS = [
  { value: "upi", label: "UPI" },
  { value: "card", label: "Card" },
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "other", label: "Other" },
];

export function methodLabel(value) {
  return PAYMENT_METHODS.find((m) => m.value === value)?.label || "Other";
}

function uniqueByName(items) {
  const seen = new Set();
  return items.filter((c) => {
    const key = (c.name || "").trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

let categoriesPromise = null;

/** Categories are read once per session, with a starter set seeded on first use. */
export function loadCategories({ force = false } = {}) {
  if (force) categoriesPromise = null;
  if (!categoriesPromise) {
    categoriesPromise = (async () => {
      const page = await base44.entities.Category.list({ sort: "created_date", limit: 100 });
      const items = page?.items ?? [];
      if (items.length) return uniqueByName(items);
      const created = await base44.entities.Category.bulkCreate(DEFAULT_CATEGORIES);
      return uniqueByName(Array.isArray(created) ? created : []);
    })().catch((err) => {
      categoriesPromise = null;
      throw err;
    });
  }
  return categoriesPromise;
}

export function invalidateCategories() {
  categoriesPromise = null;
}

function changePct(current, previous) {
  if (!previous) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

const inr = (n) => new Intl.NumberFormat("en-IN").format(Math.round(n));

function buildFeedback({ today, week, lastWeek, month, topCategory, monthLabelText }) {
  if (month === 0 && week === 0) {
    return {
      tone: "watch",
      headline: "Nothing logged yet — let's start with today.",
      body: "Add your first expense and this page fills with your daily, weekly and monthly picture.",
      chip: "Waiting on your first entry",
    };
  }
  if (today === 0) {
    return {
      tone: "good",
      headline: "Nothing spent today — a quiet day.",
      body: `${monthLabelText} stands at ₹${inr(month)} so far, and this week is tracking ${
        week <= lastWeek ? "below" : "above"
      } last week.`,
      chip: `Last week: ₹${inr(lastWeek)}`,
    };
  }
  const delta = changePct(week, lastWeek);
  if (lastWeek > 0 && delta < -4) {
    return {
      tone: "good",
      headline: "You're pacing below last week.",
      body: `You've spent ${Math.round(Math.abs(delta))}% less than the same period last week.${
        topCategory ? ` ${topCategory.name} is still your largest category this month.` : ""
      }`,
      chip: `${Math.round(Math.abs(delta))}% less than last week`,
    };
  }
  if (lastWeek > 0 && delta > 6) {
    return {
      tone: "tight",
      headline: "This week is running hotter than last.",
      body: `You're ${Math.round(delta)}% ahead of last week's pace.${
        topCategory ? ` Most of it landed in ${topCategory.name}.` : ""
      }`,
      chip: `${Math.round(delta)}% more than last week`,
    };
  }
  return {
    tone: "watch",
    headline: "Steady week — right in line with your usual pace.",
    body: topCategory
      ? `${topCategory.name} leads your spending this month, at ₹${inr(topCategory.total)} so far.`
      : "Your daily numbers are holding close to your usual rhythm.",
    chip: `Today: ₹${inr(today)}`,
  };
}

export async function loadDashboard(now = new Date()) {
  const todayKey = dateKey(now);
  const yesterdayKey = dateKey(subDays(now, 1));
  const { start: weekStart } = weekRange(now);
  const weekStartKey = dateKey(weekStart);
  const weekEndKey = dateKey(addDays(weekStart, 6));
  const lastWeekStartKey = dateKey(subDays(weekStart, 7));
  const lastWeekEndKey = dateKey(subDays(weekStart, 1));
  const { start: monthStart, end: monthEnd } = monthRange(now);
  const monthStartKey = dateKey(monthStart);
  const monthEndKey = dateKey(monthEnd);
  const lastMonthStartKey = dateKey(startOfMonth(subMonths(now, 1)));
  const lastMonthEndKey = dateKey(subDays(monthStart, 1));

  const [categories, dailyRows, monthByCategory, recentPage] = await Promise.all([
    loadCategories(),
    base44.entities.Expense.aggregate({
      query: { date: { $gte: lastMonthStartKey, $lte: monthEndKey } },
      groupBy: "date",
      sum: ["amount"],
    }),
    base44.entities.Expense.aggregate({
      query: { date: { $gte: monthStartKey, $lte: monthEndKey } },
      groupBy: "category_name",
      sum: ["amount"],
    }),
    base44.entities.Expense.filter({}, { sort: "-date", limit: 5 }),
  ]);

  const colorByName = new Map(categories.map((c) => [c.name, c.color]));
  const iconByName = new Map(categories.map((c) => [c.name, c.icon || "circle"]));
  const dailyMap = new Map(((dailyRows?.rows ?? []) || []).map((r) => [r.date, Number(r.sum_amount) || 0]));
  const sumIn = (fromKey, toKey) => {
    let total = 0;
    dailyMap.forEach((value, key) => {
      if (key >= fromKey && key <= toKey) total += value;
    });
    return total;
  };

  const today = dailyMap.get(todayKey) || 0;
  const yesterday = dailyMap.get(yesterdayKey) || 0;
  const week = sumIn(weekStartKey, weekEndKey);
  const lastWeek = sumIn(lastWeekStartKey, lastWeekEndKey);
  const month = sumIn(monthStartKey, monthEndKey);
  const lastMonth = sumIn(lastMonthStartKey, lastMonthEndKey);

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const day = addDays(weekStart, i);
    const key = dateKey(day);
    return { label: format(day, "EEE"), value: dailyMap.get(key) || 0, isToday: key === todayKey };
  });

  const categoryTotals = ((monthByCategory?.rows ?? []) || [])
    .map((row) => ({
      name: row.category_name || "Other",
      total: Number(row.sum_amount) || 0,
      color: colorByName.get(row.category_name) || "slate",
      icon: iconByName.get(row.category_name) || "circle",
    }))
    .sort((a, b) => b.total - a.total);

  const recent = (recentPage?.items ?? []).map((e) => ({
    id: e.id,
    title: e.title,
    amount: e.amount,
    date: e.date,
    category: e.category_name || "Other",
    color: e.color || "slate",
    icon: iconByName.get(e.category_name) || "circle",
  }));

  return {
    today,
    todayChange: changePct(today, yesterday),
    week,
    weekChange: changePct(week, lastWeek),
    month,
    monthChange: changePct(month, lastMonth),
    monthLabel: format(now, "MMMM"),
    recent,
    categories: categoryTotals.slice(0, 5),
    weekDays,
    feedback: buildFeedback({
      today,
      week,
      lastWeek,
      month,
      topCategory: categoryTotals[0],
      monthLabelText: format(now, "MMMM"),
    }),
  };
}

export async function loadExpenses(monthKey) {
  const start = `${monthKey}-01`;
  const end = dateKey(endOfMonth(new Date(`${start}T00:00:00`)));
  const page = await base44.entities.Expense.filter(
    { date: { $gte: start, $lte: end } },
    { sort: "-date", limit: 300 }
  );
  return page?.items ?? [];
}

export async function loadBudgets(monthKey) {
  const categories = await loadCategories();
  const start = `${monthKey}-01`;
  const end = dateKey(endOfMonth(new Date(`${start}T00:00:00`)));

  const [budgetPage, spendRows] = await Promise.all([
    base44.entities.Budget.filter({ month: monthKey }, { limit: 200 }),
    base44.entities.Expense.aggregate({
      query: { date: { $gte: start, $lte: end } },
      groupBy: "category_id",
      sum: ["amount"],
    }),
  ]);

  const spend = new Map(((spendRows?.rows ?? []) || []).map((r) => [r.category_id, Number(r.sum_amount) || 0]));
  const budgets = new Map((budgetPage?.items ?? []).map((b) => [b.category_id, b]));
  const rows = categories.map((c) => ({
    category: c,
    budget: budgets.get(c.id) || null,
    spent: spend.get(c.id) || 0,
  }));

  return { categories, rows };
}

export async function loadInsights(now = new Date()) {
  const sixStart = startOfMonth(subMonths(now, 5));
  const sixStartKey = dateKey(sixStart);
  const { start: monthStart, end: monthEnd } = monthRange(now);
  const monthStartKey = dateKey(monthStart);
  const monthEndKey = dateKey(monthEnd);
  const daysElapsed = now.getDate();

  const [categories, dayRows, monthByCategory, methodRows, largestPage] = await Promise.all([
    loadCategories(),
    base44.entities.Expense.aggregate({
      query: { date: { $gte: sixStartKey } },
      groupBy: "date",
      sum: ["amount"],
    }),
    base44.entities.Expense.aggregate({
      query: { date: { $gte: monthStartKey, $lte: monthEndKey } },
      groupBy: "category_name",
      sum: ["amount"],
    }),
    base44.entities.Expense.aggregate({
      query: { date: { $gte: monthStartKey, $lte: monthEndKey } },
      groupBy: "payment_method",
      sum: ["amount"],
    }),
    base44.entities.Expense.filter({}, { sort: "-amount", limit: 1 }),
  ]);

  const months = Array.from({ length: 6 }).map((_, i) => {
    const d = subMonths(now, 5 - i);
    return { key: format(d, "yyyy-MM"), label: format(d, "MMM"), total: 0 };
  });
  const monthIndex = new Map(months.map((m) => [m.key, m]));
  ((dayRows?.rows ?? []) || []).forEach((row) => {
    const bucket = monthIndex.get(String(row.date).slice(0, 7));
    if (bucket) bucket.total += Number(row.sum_amount) || 0;
  });

  const categoryRows = (monthByCategory?.rows ?? []) || [];
  const categoriesOut = categoryRows
    .map((r) => ({ name: r.category_name || "Other", total: Number(r.sum_amount) || 0 }))
    .sort((a, b) => b.total - a.total);

  const methods = ((methodRows?.rows ?? []) || [])
    .map((r) => ({ method: r.payment_method || "other", total: Number(r.sum_amount) || 0 }))
    .sort((a, b) => b.total - a.total);

  const monthTotal = categoryRows.reduce((sum, r) => sum + (Number(r.sum_amount) || 0), 0);
  const monthCount = categoryRows.reduce((sum, r) => sum + (Number(r.count) || 0), 0);

  return {
    months,
    categories: categoriesOut,
    methods,
    largest: (largestPage?.items ?? [])[0] || null,
    monthTotal,
    monthCount,
    avgPerDay: daysElapsed ? monthTotal / daysElapsed : 0,
    hasData: months.some((m) => m.total > 0),
    categoryColors: new Map(categories.map((c) => [c.name, c.color])),
  };
}