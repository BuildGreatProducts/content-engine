"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ReviewCard } from "@/components/features/admin/review-card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle } from "lucide-react";

export default function AdminReviewsPage() {
  const items = useQuery(api.content.listHighPriorityUnreviewed);

  return (
    <div>
      <h1 className="text-[var(--text-2xl)] font-semibold text-[var(--color-text-primary)] mb-[var(--space-6)]">
        Pending Reviews
      </h1>

      {items === undefined ? (
        <div className="flex flex-col gap-[var(--space-4)]">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CheckCircle
            size={48}
            className="text-[var(--color-success)] mb-[var(--space-4)]"
          />
          <p className="text-[var(--text-lg)] font-medium text-[var(--color-text-primary)]">
            All caught up
          </p>
          <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)] mt-[var(--space-1)]">
            No content awaiting review.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-[var(--space-4)]">
          {items.map((item) => (
            <ReviewCard
              key={item._id}
              id={item._id}
              type={item.type}
              output={item.output}
              createdAt={item.createdAt}
              workspaceName={item.workspaceName}
            />
          ))}
        </div>
      )}
    </div>
  );
}
