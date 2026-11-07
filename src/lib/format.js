import { format, startOfWeek, startOfMonth, endOfMonth } from "date-fns";

export const CURRENCY_SYMBOL = "₹";

/** Plain grouped number, e.g. 12,480 */
export function formatMoney(amount, { decimals = 0 } = {}) {
  const n = Number(amount) || 0;
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Number with the currency symbol, e.g. ₹12,480 */
export function money(amount, opts) {
  const n = Number(amount) || 0;
  const sign = n < 0 ? "-" : "";
  return sign + CURRENCY_SYMBOL + formatMoney(Math.abs(n), opts);
}

/** Split money so the symbol can be rendered smaller than the figure. */
export function moneyParts(amount, { decimals = 0 } = {}) {
  const n = Number(amount) || 0;
  return {
    sign: n < 0 ? "-" : "",
    symbol: CURRENCY_SYMBOL,
    value: formatMoney(Math.abs(n), { decimals }),
  };
}

/** Compact money for tight spots: ₹12.5k */
export function moneyShort(amount) {
  const n = Number(amount) || 0;
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 100000) return `${sign}${CURRENCY_SYMBOL}${(abs / 100000).toFixed(1)}L`;
  if (abs >= 1000) return `${sign}${CURRENCY_SYMBOL}${(abs / 1000).toFixed(abs >= 10000 ? 0 : 1)}k`;
  return `${sign}${CURRENCY_SYMBOL}${formatMoney(abs)}`;
}

/** "2026-11-08" or ISO → local Date, avoid UTC drift */
export function parseDate(value) {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  const [y, m, d] = String(value).slice(0, 10).split("-").map(Number);
  if (!y) return new Date(value);
  return new Date(y, (m || 1) - 1, d || 1);
}

/** Date → "2026-11-08" */
export function dateKey(date) {
  return format(date, "yyyy-MM-dd");
}

/** "Sun, 8 Nov" */
export function shortDate(value) {
  return format(parseDate(value), "EEE, d MMM");
}

/** "8 November 2026" */
export function longDate(value) {
  return format(parseDate(value), "d MMMM yyyy");
}

export function monthLabel(date = new Date()) {
  return format(date, "MMMM yyyy");
}

export function weekRange(date = new Date()) {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return { start, end };
}

export function monthRange(date = new Date()) {
  return { start: startOfMonth(date), end: endOfMonth(date) };
}

/** Friendly relative label: Today / Yesterday / Sun, 8 Nov */
export function relativeDay(value) {
  const date = parseDate(value);
  const today = new Date();
  const key = dateKey(date);
  if (key === dateKey(today)) return "Today";
  const y = new Date(today);
  y.setDate(y.getDate() - 1);
  if (key === dateKey(y)) return "Yesterday";
  return shortDate(date);
}

export function percentChange(current, previous) {
  if (!previous) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export const CATEGORY_COLORS = {
  indigo: "#3D6BF5",
  emerald: "#11946B",
  amber: "#D68A13",
  rose: "#D64562",
  violet: "#7C5CD6",
  teal: "#0E93A4",
  orange: "#DD6B2F",
  slate: "#647089",
};

export const CATEGORY_COLOR_KEYS = Object.keys(CATEGORY_COLORS);

export function categoryColor(key) {
  return CATEGORY_COLORS[key] || CATEGORY_COLORS.slate;
}

/** Soft tinted background for a category accent. */
export function categoryTint(key, alpha = 0.12) {
  const hex = categoryColor(key).replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}