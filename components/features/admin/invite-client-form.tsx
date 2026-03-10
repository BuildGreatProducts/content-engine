"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { Send, UserPlus } from "lucide-react";

type AddMethod = "create" | "invite";

export function InviteClientForm({ workspaceId }: { workspaceId: Id<"workspaces"> }) {
  const sendInvitation = useAction(api.invitations.send);
  const createClient = useAction(api.invitations.createClient);
  const { toast } = useToast();

  const [addMethod, setAddMethod] = useState<AddMethod>("create");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [inviteEmail, setInviteEmail] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPassword, setClientPassword] = useState("");

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setError("");
    setIsSubmitting(true);
    try {
      await sendInvitation({ workspaceId, email: inviteEmail.trim() });
      toast("Invitation sent", "success");
      setInviteEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invitation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientEmail.trim() || !clientPassword.trim()) return;
    if (clientPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      await createClient({
        workspaceId,
        email: clientEmail.trim(),
        password: clientPassword,
        name: clientName.trim(),
      });
      toast("Client account created", "success");
      setClientName("");
      setClientEmail("");
      setClientPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create client");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <h2 className="text-[var(--text-lg)] font-medium text-[var(--color-text-primary)] mb-[var(--space-4)]">
        Add Client
      </h2>

      <div className="flex gap-1 p-1 bg-[var(--color-surface-2)] rounded-[var(--radius-md)] mb-[var(--space-4)] w-fit">
        <button
          type="button"
          onClick={() => { setAddMethod("create"); setError(""); }}
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
          onClick={() => { setAddMethod("invite"); setError(""); }}
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
        <form onSubmit={handleCreateClient} className="flex flex-col gap-[var(--space-3)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--space-3)]">
            <div>
              <label className="block text-[var(--text-sm)] text-[var(--color-text-secondary)] mb-[var(--space-1)]">
                Name
              </label>
              <Input placeholder="Client name" value={clientName} onChange={(e) => setClientName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-[var(--text-sm)] text-[var(--color-text-secondary)] mb-[var(--space-1)]">
                Email
              </label>
              <Input type="email" placeholder="client@example.com" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} required />
            </div>
          </div>
          <div>
            <label className="block text-[var(--text-sm)] text-[var(--color-text-secondary)] mb-[var(--space-1)]">
              Password
            </label>
            <Input type="password" placeholder="Min 8 characters" value={clientPassword} onChange={(e) => setClientPassword(e.target.value)} required minLength={8} />
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
          <Input type="email" placeholder="client@example.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="flex-1" required />
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
  );
}
