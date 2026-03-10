import { AlertTriangle } from "lucide-react";

export function HighPriorityFlag() {
  return (
    <div className="flex items-start gap-[var(--space-3)] p-[var(--space-4)] rounded-[var(--radius-md)] bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30">
      <AlertTriangle size={18} className="text-[var(--color-warning)] shrink-0 mt-0.5" />
      <div>
        <p className="text-[var(--text-sm)] font-medium text-[var(--color-warning)]">
          High-priority content
        </p>
        <p className="text-[var(--text-xs)] text-[var(--color-text-secondary)] mt-1">
          This content type is flagged for admin review.
        </p>
      </div>
    </div>
  );
}
