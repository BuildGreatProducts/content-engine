"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { getContentType } from "@/lib/content-types";
import { InviteClientForm } from "./invite-client-form";
import { InvitationList } from "./invitation-list";
import { DocumentEditor } from "./document-editor";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Tab = "overview" | "documents" | "invitations";
const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "documents", label: "Documents" },
  { key: "invitations", label: "Invitations" },
];

export function WorkspaceDetail({ workspaceId }: { workspaceId: string }) {
  const wsId = workspaceId as Id<"workspaces">;
  const workspace = useQuery(api.workspaces.getById, { id: wsId });
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  if (workspace === undefined) {
    return (
      <div className="flex flex-col gap-[var(--space-6)]">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (workspace === null) {
    return (
      <Card className="text-center py-12">
        <p className="text-[var(--color-text-secondary)]">
          Workspace not found.
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      {/* Header */}
      <div className="flex items-center gap-[var(--space-3)]">
        <Link
          href="/admin/workspaces"
          className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-[var(--text-2xl)] font-semibold text-[var(--color-text-primary)]">
            {workspace.name}
          </h1>
          <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
            /{workspace.slug}
          </p>
        </div>
        <Badge
          variant={workspace.isActive ? "success" : "default"}
          className="ml-auto"
        >
          {workspace.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      {/* Tab navigation */}
      <div className="flex border-b border-[var(--color-border)]">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2.5 text-[var(--text-sm)] font-medium transition-colors cursor-pointer -mb-px",
              activeTab === tab.key
                ? "text-[var(--color-accent)] border-b-2 border-[var(--color-accent)]"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "overview" && <OverviewTab workspaceId={wsId} workspace={workspace} />}
      {activeTab === "documents" && <DocumentEditor workspaceId={wsId} />}
      {activeTab === "invitations" && (
        <div className="flex flex-col gap-[var(--space-6)]">
          <InviteClientForm workspaceId={wsId} />
          <InvitationList workspaceId={wsId} />
        </div>
      )}
    </div>
  );
}

function OverviewTab({
  workspaceId,
  workspace,
}: {
  workspaceId: Id<"workspaces">;
  workspace: { _id: Id<"workspaces">; name: string; slug: string; description?: string; isActive: boolean; createdAt: number; updatedAt: number };
}) {
  const clients = useQuery(api.users.listClients, { workspaceId });
  const content = useQuery(api.content.listByWorkspace, { workspaceId });
  const updateWorkspace = useMutation(api.workspaces.update);
  const { toast } = useToast();

  const [showToggleModal, setShowToggleModal] = useState(false);
  const [toggling, setToggling] = useState(false);

  const handleToggleActive = async () => {
    setToggling(true);
    try {
      await updateWorkspace({ id: workspaceId, isActive: !workspace.isActive });
      toast(
        workspace.isActive ? "Workspace deactivated" : "Workspace activated",
        "success"
      );
      setShowToggleModal(false);
    } catch (err) {
      toast("Failed to update workspace", "error");
    } finally {
      setToggling(false);
    }
  };

  const clientList = clients ?? [];
  const contentItems = content ?? [];
  const recentContent = contentItems.slice(0, 5);

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      {/* Workspace info */}
      <Card>
        <div className="flex flex-col gap-[var(--space-4)]">
          {workspace.description && (
            <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
              {workspace.description}
            </p>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-[var(--space-4)]">
            <div>
              <p className="text-[var(--text-xs)] text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">
                Created
              </p>
              <p className="text-[var(--text-sm)] text-[var(--color-text-primary)]">
                {new Date(workspace.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-[var(--text-xs)] text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">
                Clients
              </p>
              <p className="text-[var(--text-sm)] text-[var(--color-text-primary)]">
                {clientList.length}
              </p>
            </div>
            <div>
              <p className="text-[var(--text-xs)] text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">
                Content Items
              </p>
              <p className="text-[var(--text-sm)] text-[var(--color-text-primary)]">
                {contentItems.length}
              </p>
            </div>
            <div>
              <p className="text-[var(--text-xs)] text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">
                Status
              </p>
              <Button
                variant={workspace.isActive ? "secondary" : "primary"}
                size="sm"
                onClick={() => setShowToggleModal(true)}
              >
                {workspace.isActive ? "Deactivate" : "Activate"}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Clients */}
      {clientList.length > 0 && (
        <Card>
          <h2 className="text-[var(--text-lg)] font-medium text-[var(--color-text-primary)] mb-[var(--space-4)]">
            Clients
          </h2>
          <div className="flex flex-col gap-[var(--space-2)]">
            {clientList.map((client) => (
              <div
                key={client._id}
                className="flex items-center justify-between px-4 py-3 rounded-[var(--radius-md)] bg-[var(--color-surface-2)] border border-[var(--color-border)]"
              >
                <div>
                  <p className="text-[var(--text-sm)] text-[var(--color-text-primary)]">
                    {client.name}
                  </p>
                  <p className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">
                    {client.email}
                  </p>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent content */}
      {recentContent.length > 0 && (
        <Card>
          <h2 className="text-[var(--text-lg)] font-medium text-[var(--color-text-primary)] mb-[var(--space-4)]">
            Recent Content
          </h2>
          <div className="flex flex-col gap-[var(--space-2)]">
            {recentContent.map((item) => {
              const ct = getContentType(item.type);
              const isFailed = item.output.startsWith("GENERATION_FAILED:");
              return (
                <div
                  key={item._id}
                  className="flex items-center justify-between px-4 py-3 rounded-[var(--radius-md)] bg-[var(--color-surface-2)] border border-[var(--color-border)]"
                >
                  <div className="flex items-center gap-[var(--space-3)]">
                    <span className="text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] uppercase">
                      {ct?.name ?? item.type}
                    </span>
                    {isFailed && <Badge variant="error">Failed</Badge>}
                    {!isFailed && item.isHighPriority && !item.reviewedByAdmin && (
                      <Badge variant="warning">Pending Review</Badge>
                    )}
                    {item.reviewedByAdmin && <Badge variant="success">Reviewed</Badge>}
                  </div>
                  <span className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">
                    {new Date(item.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Toggle active modal */}
      <Modal open={showToggleModal} onClose={() => setShowToggleModal(false)}>
        <h2 className="text-[var(--text-lg)] font-semibold text-[var(--color-text-primary)] mb-[var(--space-3)]">
          {workspace.isActive ? "Deactivate" : "Activate"} Workspace
        </h2>
        <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)] mb-[var(--space-6)]">
          {workspace.isActive
            ? `Are you sure you want to deactivate "${workspace.name}"? Clients will lose access to content generation.`
            : `Re-activate "${workspace.name}"? Clients will regain access to content generation.`}
        </p>
        <div className="flex justify-end gap-[var(--space-3)]">
          <Button variant="secondary" onClick={() => setShowToggleModal(false)}>
            Cancel
          </Button>
          <Button
            variant={workspace.isActive ? "destructive" : "primary"}
            onClick={handleToggleActive}
            disabled={toggling}
          >
            {toggling
              ? "Updating..."
              : workspace.isActive
                ? "Deactivate"
                : "Activate"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
