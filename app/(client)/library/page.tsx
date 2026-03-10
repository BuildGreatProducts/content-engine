"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CONTENT_TYPES } from "@/lib/content-types";
import { LibraryCard } from "@/components/features/content/library-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BookOpen } from "lucide-react";
import Link from "next/link";

type ContentTypeFilter = string | undefined;

export default function LibraryPage() {
  const [activeType, setActiveType] = useState<ContentTypeFilter>(undefined);
  const workspace = useQuery(api.workspaces.getMine);

  const { results, status, loadMore } = usePaginatedQuery(
    api.content.listByWorkspacePaginated,
    workspace?._id
      ? { workspaceId: workspace._id, type: activeType as any }
      : "skip",
    { initialNumItems: 20 }
  );

  if (workspace === undefined) {
    return (
      <div className="flex flex-col gap-[var(--space-6)]">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--space-4)]">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--color-text-secondary)]">No workspace found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      <h1 className="text-[var(--text-2xl)] font-semibold text-[var(--color-text-primary)]">
        Library
      </h1>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-[var(--space-2)]">
        <button
          onClick={() => setActiveType(undefined)}
          className={cn(
            "px-3 py-1.5 rounded-[var(--radius-md)] text-[var(--text-sm)] transition-colors cursor-pointer",
            activeType === undefined
              ? "bg-[var(--color-accent)] text-white"
              : "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          )}
        >
          All
        </button>
        {CONTENT_TYPES.map((ct) => (
          <button
            key={ct.id}
            onClick={() => setActiveType(ct.id)}
            className={cn(
              "px-3 py-1.5 rounded-[var(--radius-md)] text-[var(--text-sm)] transition-colors cursor-pointer",
              activeType === ct.id
                ? "bg-[var(--color-accent)] text-white"
                : "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            )}
          >
            {ct.name}
          </button>
        ))}
      </div>

      {/* Content grid */}
      {status === "LoadingFirstPage" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--space-4)]">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-[var(--space-4)]">
          <BookOpen size={48} className="text-[var(--color-text-secondary)]" />
          <p className="text-[var(--color-text-secondary)] text-center max-w-sm">
            No content yet. Pick a content type and create your first piece.
          </p>
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--space-4)]">
            {results.map((item) => (
              <LibraryCard
                key={item._id}
                type={item.type}
                output={item.output}
                createdAt={item.createdAt}
                isHighPriority={item.isHighPriority}
                reviewedByAdmin={item.reviewedByAdmin}
              />
            ))}
          </div>
          {status === "CanLoadMore" && (
            <div className="flex justify-center">
              <Button variant="secondary" onClick={() => loadMore(20)}>
                Load More
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
