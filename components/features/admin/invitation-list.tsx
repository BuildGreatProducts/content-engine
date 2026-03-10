"use client";

import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { Clock, CheckCircle, XCircle, Send } from "lucide-react";

export function InvitationList({ workspaceId }: { workspaceId: Id<"workspaces"> }) {
  const invitations = useQuery(api.invitations.listByWorkspace, { workspaceId });
  const clients = useQuery(api.users.listClients, { workspaceId });
  const sendInvitation = useAction(api.invitations.send);
  const { toast } = useToast();
  const [resendingId, setResendingId] = useState<string | null>(null);

  const handleResend = async (email: string, invId: string) => {
    setResendingId(invId);
    try {
      await sendInvitation({ workspaceId, email });
      toast("Invitation resent", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to resend", "error");
    } finally {
      setResendingId(null);
    }
  };

  const clientList = clients ?? [];

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
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

      {/* Invitations */}
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
              const isPending = !isAccepted && !isExpired;

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
                  <div className="flex items-center gap-[var(--space-2)]">
                    {isPending && (
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={resendingId === inv._id}
                        onClick={() => handleResend(inv.email, inv._id)}
                      >
                        <Send size={12} className="mr-1" />
                        {resendingId === inv._id ? "Sending..." : "Resend"}
                      </Button>
                    )}
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
