import type { PropsWithChildren, ReactNode } from "react";

type PanelProps = PropsWithChildren<{
  title: string;
  actions?: ReactNode;
  className?: string;
}>;

export function Panel({ title, actions, className = "", children }: PanelProps) {
  return (
    <section
      className={`rounded-3xl border border-[var(--panel-border)] bg-[var(--panel)]/95 p-4 shadow-panel backdrop-blur ${className}`}
    >
      <header className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">
          {title}
        </h2>
        {actions}
      </header>
      {children}
    </section>
  );
}
