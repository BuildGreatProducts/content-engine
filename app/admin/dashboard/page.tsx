"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { StatsCards } from "@/components/features/admin/stats-cards";
import { WorkspaceList } from "@/components/features/admin/workspace-list";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const pendingReviews = useQuery(api.content.listHighPriorityUnreviewed);
  const count = pendingReviews?.length ?? 0;

  return (
    <div>
      <h1 className="text-[var(--text-2xl)] font-semibold text-[var(--color-text-primary)] mb-[var(--space-6)]">
        Dashboard
      </h1>
      <div className="flex flex-col gap-[var(--space-8)]">
        <StatsCards />

        {pendingReviews === undefined ? (
          <Skeleton className="h-14 w-full" />
        ) : count > 0 ? (
          <Card className="border-[var(--color-warning)]/30 bg-[var(--color-warning)]/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[var(--space-3)]">
                <AlertTriangle size={18} className="text-[var(--color-warning)]" />
                <span className="text-[var(--text-sm)] font-medium text-[var(--color-warning)]">
                  {count} piece{count !== 1 ? "s" : ""} of high-priority content awaiting your review
                </span>
              </div>
              <Link
                href="/admin/reviews"
                className="text-[var(--text-sm)] font-medium text-[var(--color-accent)] hover:underline"
              >
                View all
              </Link>
            </div>
          </Card>
        ) : null}

        <div>
          <h2 className="text-[var(--text-lg)] font-medium text-[var(--color-text-primary)] mb-[var(--space-4)]">
            Workspaces
          </h2>
          <WorkspaceList />
        </div>
      </div>
    </div>
  );
}
