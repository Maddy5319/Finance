export default function InsightsPreview() {
  const ghost = [38, 62, 46, 84, 55, 72, 40, 66, 50, 78, 44, 58];
  return (
    <div className="rounded-2xl border border-dashed border-border bg-secondary/40 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold tracking-[-0.01em] text-foreground">Insights preview</p>
          <p className="mt-1 max-w-[36ch] text-[11.5px] leading-relaxed text-muted-foreground">
            Log a few expenses and this space fills with your spending rhythm, category trends and budget pace.
          </p>
        </div>
        <span className="shrink-0 rounded-md border border-border bg-card px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Preview
        </span>
      </div>
      <div className="mt-4 flex h-[64px] items-end gap-1.5 opacity-40" aria-hidden="true">
        {ghost.map((height, index) => (
          <div
            key={index}
            className="flex-1 rounded-t-[4px] bg-[repeating-linear-gradient(135deg,hsl(var(--muted-foreground)/0.45)_0_4px,transparent_4px_8px)]"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  );
}