"use client";

import { StatsCards } from "@/components/features/admin/stats-cards";
import { WorkspaceList } from "@/components/features/admin/workspace-list";

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-[var(--text-2xl)] font-semibold text-[var(--color-text-primary)] mb-[var(--space-6)]">
        Dashboard
      </h1>
      <div className="flex flex-col gap-[var(--space-8)]">
        <StatsCards />
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
