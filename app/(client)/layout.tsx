import { ReactNode } from "react";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-60 border-r border-[var(--color-border)] bg-[var(--color-surface)] p-[var(--space-4)]">
        <div className="text-[var(--text-sm)] font-semibold text-[var(--color-text-primary)] mb-[var(--space-6)]">
          Content Engine
        </div>
        <nav className="flex flex-col gap-1">
          <a
            href="/dashboard"
            className="px-3 py-2 rounded-[var(--radius-md)] text-[var(--text-sm)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)]"
          >
            Dashboard
          </a>
          <a
            href="/library"
            className="px-3 py-2 rounded-[var(--radius-md)] text-[var(--text-sm)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)]"
          >
            Library
          </a>
        </nav>
      </aside>
      <main className="flex-1 p-[var(--space-8)]">{children}</main>
    </div>
  );
}
