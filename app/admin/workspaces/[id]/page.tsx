"use client";

import { use } from "react";
import { WorkspaceDetail } from "@/components/features/admin/workspace-detail";

export default function WorkspaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <WorkspaceDetail workspaceId={id} />;
}
