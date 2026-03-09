import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-[var(--color-surface-2)] rounded-[var(--radius-md)] animate-pulse",
        className
      )}
      {...props}
    />
  );
}
