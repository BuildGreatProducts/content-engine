"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function WorkspaceList() {
  const workspaces = useQuery(api.workspaces.listWithStats);
  const router = useRouter();

  if (workspaces === undefined) {
    return (
      <div className="flex flex-col gap-[var(--space-3)]">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (workspaces === null) {
    return null;
  }

  if (workspaces.length === 0) {
    return (
      <Card className="text-center py-12">
        <p className="text-[var(--color-text-secondary)] text-[var(--text-sm)]">
          No workspaces yet. Create your first workspace to get started.
        </p>
      </Card>
    );
  }

  return (
    <div className="border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
            <th className="text-left px-4 py-3 text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
              Workspace
            </th>
            <th className="text-left px-4 py-3 text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] uppercase tracking-wider hidden md:table-cell">
              Client
            </th>
            <th className="text-left px-4 py-3 text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] uppercase tracking-wider hidden md:table-cell">
              Content
            </th>
            <th className="text-left px-4 py-3 text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] uppercase tracking-wider hidden lg:table-cell">
              Documents
            </th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {workspaces.map((ws) => (
            <tr
              key={ws._id}
              className="border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-surface-2)]/50"
            >
              <td className="px-4 py-3">
                <div className="text-[var(--text-sm)] font-medium text-[var(--color-text-primary)]">
                  {ws.name}
                </div>
                <div className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">
                  {ws.slug}
                </div>
              </td>
              <td className="px-4 py-3 text-[var(--text-sm)] text-[var(--color-text-secondary)] hidden md:table-cell">
                {ws.clientEmail ?? <span className="text-[var(--color-text-secondary)]/50">No client</span>}
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                <Badge variant={ws.contentCount > 0 ? "info" : "default"}>
                  {ws.contentCount}
                </Badge>
              </td>
              <td className="px-4 py-3 hidden lg:table-cell">
                <div className="flex gap-1.5" role="list" aria-label="Document status">
                  {ws.documentStatus.map((doc) => (
                    <div
                      key={doc.type}
                      role="listitem"
                      className={`w-2.5 h-2.5 rounded-full ${
                        doc.uploaded
                          ? "bg-[var(--color-success)]"
                          : "bg-[var(--color-border)]"
                      }`}
                      aria-label={`${doc.type.replace(/_/g, " ")}: ${doc.uploaded ? "uploaded" : "missing"}`}
                    />
                  ))}
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => router.push(`/admin/workspaces/${ws._id}`)}
                >
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
