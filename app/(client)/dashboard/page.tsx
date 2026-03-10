"use client";

import { ContentTypeGrid } from "@/components/features/content/content-type-grid";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-[var(--text-2xl)] font-semibold text-[var(--color-text-primary)] mb-[var(--space-6)]">
        What would you like to create?
      </h1>
      <ContentTypeGrid />
    </div>
  );
}
