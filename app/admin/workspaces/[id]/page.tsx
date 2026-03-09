"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { WorkspaceDetail } from "@/components/features/admin/workspace-detail";

export default function WorkspaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  // Basic validation — Convex IDs are non-empty strings
  if (!id || id.length < 10) {
    notFound();
  }

  return <WorkspaceDetail workspaceId={id} />;
}
