import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "info";
}

const variantStyles: Record<string, string> = {
  default:
    "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border-[var(--color-border)]",
  success:
    "bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/30",
  warning:
    "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/30",
  error:
    "bg-[var(--color-error)]/10 text-[var(--color-error)] border-[var(--color-error)]/30",
  info: "bg-[var(--color-info)]/10 text-[var(--color-info)] border-[var(--color-info)]/30",
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center border rounded-[var(--radius-sm)] px-2 py-0.5 text-[var(--text-xs)] font-medium uppercase tracking-[0.05em]",
          variantStyles[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";
