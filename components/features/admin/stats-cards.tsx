"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, FileText, AlertCircle } from "lucide-react";

export function StatsCards() {
  const workspaces = useQuery(api.workspaces.listWithStats);

  if (workspaces === undefined || workspaces === null) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--space-4)]">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  const totalWorkspaces = workspaces.length;
  const totalContent = workspaces.reduce((sum, ws) => sum + ws.contentCount, 0);
  const pendingReviews = workspaces.reduce((sum, ws) => sum + ws.pendingReviews, 0);

  const stats = [
    {
      label: "Total Workspaces",
      value: totalWorkspaces,
      icon: Building2,
      color: "var(--color-accent)",
    },
    {
      label: "Total Content",
      value: totalContent,
      icon: FileText,
      color: "var(--color-success)",
    },
    {
      label: "Pending Reviews",
      value: pendingReviews,
      icon: AlertCircle,
      color: "var(--color-warning)",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--space-4)]">
      {stats.map((stat) => (
        <Card key={stat.label} className="flex items-center gap-[var(--space-4)]">
          <div
            className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center shrink-0"
            style={{ backgroundColor: `color-mix(in srgb, ${stat.color} 15%, transparent)` }}
          >
            <stat.icon size={20} style={{ color: stat.color }} />
          </div>
          <div>
            <p className="text-[var(--text-2xl)] font-semibold text-[var(--color-text-primary)]">
              {stat.value}
            </p>
            <p className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">
              {stat.label}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}
