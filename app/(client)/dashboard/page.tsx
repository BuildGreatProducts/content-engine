"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ContentTypeGrid } from "@/components/features/content/content-type-grid";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const workspace = useQuery(api.workspaces.getMine);

  return (
    <div>
      <h1 className="text-[var(--text-2xl)] font-semibold text-[var(--color-text-primary)] mb-[var(--space-6)]">
        What would you like to create?
      </h1>
      {workspace === undefined ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--space-4)]">
          {Array.from({ length: 7 }, (_, i) => (
            <Skeleton key={i} className="h-[88px] w-full" />
          ))}
        </div>
      ) : (
        <ContentTypeGrid />
      )}
    </div>
  );
}
