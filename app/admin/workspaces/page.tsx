"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { WorkspaceList } from "@/components/features/admin/workspace-list";
import { Plus } from "lucide-react";

export default function WorkspacesPage() {
  const router = useRouter();

  return (
    <div>
      <div className="flex items-center justify-between mb-[var(--space-6)]">
        <h1 className="text-[var(--text-2xl)] font-semibold text-[var(--color-text-primary)]">
          Workspaces
        </h1>
        <Button size="sm" onClick={() => router.push("/admin/workspaces/new")}>
          <Plus size={16} className="mr-1.5" />
          New Workspace
        </Button>
      </div>
      <WorkspaceList />
    </div>
  );
}
