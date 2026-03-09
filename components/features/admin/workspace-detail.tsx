"use client";

import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  UserPlus,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

type AddMethod = "create" | "invite";

export function WorkspaceDetail({ workspaceId }: { workspaceId: string }) {
  const wsId = workspaceId as Id<"workspaces">;
  const workspace = useQuery(api.workspaces.getById, { id: wsId });
  const invitations = useQuery(api.invitations.listByWorkspace, { workspaceId: wsId });
  const clients = useQuery(api.users.listClients, { workspaceId: wsId });

  const sendInvitation = useAction(api.invitations.send);
  const createClient = useAction(api.invitations.createClient);
  const { toast } = useToast();

  const [addMethod, setAddMethod] = useState<AddMethod>("create");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState("");

  // Create form state
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPassword, setClientPassword] = useState("");

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setError("");
    setIsSubmitting(true);
    try {
      await sendInvitation({
        workspaceId: wsId,
        email: inviteEmail.trim(),
      });
      toast("Invitation sent", "success");
      setInviteEmail("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to send invitation";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientEmail.trim() || !clientPassword.trim())
      return;
    if (clientPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      await createClient({
        workspaceId: wsId,
        email: clientEmail.trim(),
        password: clientPassword,
        name: clientName.trim(),
      });
      toast("Client account created", "success");
      setClientName("");
      setClientEmail("");
      setClientPassword("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create client";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const clientList = clients ?? [];

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

      {/* Description */}
      {workspace.description && (
        <Card>
          <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
            {workspace.description}
          </p>
        </Card>
      )}

      {/* Add Client */}
      <Card>
        <h2 className="text-[var(--text-lg)] font-medium text-[var(--color-text-primary)] mb-[var(--space-4)]">
          Add Client
        </h2>

        {/* Method toggle */}
        <div className="flex gap-1 p-1 bg-[var(--color-surface-2)] rounded-[var(--radius-md)] mb-[var(--space-4)] w-fit">
          <button
            type="button"
            onClick={() => {
              setAddMethod("create");
              setError("");
            }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] text-[var(--text-sm)] transition-colors cursor-pointer",
              addMethod === "create"
                ? "bg-[var(--color-accent)] text-white"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            )}
          >
            <UserPlus size={14} />
            Create Account
          </button>
          <button
            type="button"
            onClick={() => {
              setAddMethod("invite");
              setError("");
            }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] text-[var(--text-sm)] transition-colors cursor-pointer",
              addMethod === "invite"
                ? "bg-[var(--color-accent)] text-white"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            )}
          >
            <Send size={14} />
            Email Invite
          </button>
        </div>

        {addMethod === "create" ? (
          <form
            onSubmit={handleCreateClient}
            className="flex flex-col gap-[var(--space-3)]"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--space-3)]">
              <div>
                <label className="block text-[var(--text-sm)] text-[var(--color-text-secondary)] mb-[var(--space-1)]">
                  Name
                </label>
                <Input
                  placeholder="Client name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-[var(--text-sm)] text-[var(--color-text-secondary)] mb-[var(--space-1)]">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="client@example.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-[var(--text-sm)] text-[var(--color-text-secondary)] mb-[var(--space-1)]">
                Password
              </label>
              <Input
                type="password"
                placeholder="Min 8 characters"
                value={clientPassword}
                onChange={(e) => setClientPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <div>
              <Button type="submit" disabled={isSubmitting}>
                <UserPlus size={16} className="mr-1.5" />
                {isSubmitting ? "Creating..." : "Create Account"}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSendInvite} className="flex gap-[var(--space-3)]">
            <Input
              type="email"
              placeholder="client@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1"
              required
            />
            <Button type="submit" disabled={isSubmitting || !inviteEmail.trim()}>
              <Send size={16} className="mr-1.5" />
              {isSubmitting ? "Sending..." : "Send Invite"}
            </Button>
          </form>
        )}

        {error && (
          <p className="text-[var(--text-sm)] text-[var(--color-error)] mt-[var(--space-2)]">
            {error}
          </p>
        )}
      </Card>

      {/* Current Clients */}
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

      {/* Invitations List */}
      <Card>
        <h2 className="text-[var(--text-lg)] font-medium text-[var(--color-text-primary)] mb-[var(--space-4)]">
          Invitations
        </h2>

        {invitations === undefined || invitations === null ? (
          <div className="flex flex-col gap-[var(--space-3)]">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : invitations.length === 0 ? (
          <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
            No invitations sent yet.
          </p>
        ) : (
          <div className="flex flex-col gap-[var(--space-2)]">
            {invitations.map((inv) => {
              const isExpired = inv.expiresAt < Date.now();
              const isAccepted = !!inv.acceptedAt;

              return (
                <div
                  key={inv._id}
                  className="flex items-center justify-between px-4 py-3 rounded-[var(--radius-md)] bg-[var(--color-surface-2)] border border-[var(--color-border)]"
                >
                  <div>
                    <p className="text-[var(--text-sm)] text-[var(--color-text-primary)]">
                      {inv.email}
                    </p>
                    <p className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">
                      Sent{" "}
                      {new Date(inv.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    {isAccepted ? (
                      <Badge variant="success">
                        <CheckCircle size={12} className="mr-1" />
                        Accepted
                      </Badge>
                    ) : isExpired ? (
                      <Badge variant="error">
                        <XCircle size={12} className="mr-1" />
                        Expired
                      </Badge>
                    ) : (
                      <Badge variant="warning">
                        <Clock size={12} className="mr-1" />
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
