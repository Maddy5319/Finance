import { cn } from "@/lib/utils";

export default function Panel({ title, subtitle, action, children, className, bodyClassName }) {
  return (
    <section className={cn("overflow-hidden rounded-2xl border border-border bg-card shadow-card", className)}>
      {title || action ? (
        <header className="flex items-start justify-between gap-3 border-b border-border/70 px-4 py-3.5 sm:px-5">
          <div className="min-w-0">
            <h2 className="text-[13.5px] font-semibold tracking-[-0.01em] text-foreground">{title}</h2>
            {subtitle ? <p className="mt-0.5 text-[11.5px] text-muted-foreground">{subtitle}</p> : null}
          </div>
          {action ? <div className="shrink-0 pt-0.5">{action}</div> : null}
        </header>
      ) : null}
      <div className={cn("p-4 sm:p-5", bodyClassName)}>{children}</div>
    </section>
  );
}