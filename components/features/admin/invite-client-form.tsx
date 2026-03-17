"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { Send, UserPlus } from "lucide-react";
import {
  createClientSchema,
  inviteEmailSchema,
  type CreateClientFormData,
  type InviteEmailFormData,
} from "@/lib/validations/invitation";

type AddMethod = "create" | "invite";

export function InviteClientForm({ workspaceId }: { workspaceId: Id<"workspaces"> }) {
  const sendInvitation = useAction(api.invitations.send);
  const createClient = useAction(api.invitations.createClient);
  const { toast } = useToast();

  const [addMethod, setAddMethod] = useState<AddMethod>("create");
  const [serverError, setServerError] = useState("");

  const createForm = useForm<CreateClientFormData>({
    resolver: zodResolver(createClientSchema),
    mode: "onBlur",
  });

  const inviteForm = useForm<InviteEmailFormData>({
    resolver: zodResolver(inviteEmailSchema),
    mode: "onBlur",
  });

  const handleCreateClient = async (data: CreateClientFormData) => {
    setServerError("");
    try {
      await createClient({
        workspaceId,
        email: data.email,
        password: data.password,
        name: data.name,
      });
      toast("Client account created", "success");
      createForm.reset();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Failed to create client");
    }
  };

  const handleSendInvite = async (data: InviteEmailFormData) => {
    setServerError("");
    try {
      await sendInvitation({ workspaceId, email: data.email });
      toast("Invitation sent", "success");
      inviteForm.reset();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Failed to send invitation");
    }
  };

  return (
    <Card>
      <h2 className="text-[var(--text-lg)] font-medium text-[var(--color-text-primary)] mb-[var(--space-4)]">
        Add Client
      </h2>

      <div className="flex gap-1 p-1 bg-[var(--color-surface-2)] rounded-[var(--radius-md)] mb-[var(--space-4)] w-fit" role="group" aria-label="Client addition method">
        <button
          type="button"
          aria-pressed={addMethod === "create"}
          onClick={() => { setAddMethod("create"); setServerError(""); inviteForm.reset(); }}
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
          aria-pressed={addMethod === "invite"}
          onClick={() => { setAddMethod("invite"); setServerError(""); createForm.reset(); }}
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
        <form onSubmit={createForm.handleSubmit(handleCreateClient)} className="flex flex-col gap-[var(--space-3)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--space-3)]">
            <div>
              <label htmlFor="create-client-name" className="block text-[var(--text-sm)] text-[var(--color-text-secondary)] mb-[var(--space-1)]">
                Name
              </label>
              <Input
                id="create-client-name"
                placeholder="Client name"
                aria-invalid={!!createForm.formState.errors.name}
                aria-describedby={createForm.formState.errors.name ? "create-client-name-error" : undefined}
                {...createForm.register("name")}
              />
              {createForm.formState.errors.name && (
                <p id="create-client-name-error" className="text-[var(--text-xs)] text-[var(--color-error)] mt-1">
                  {createForm.formState.errors.name.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="create-client-email" className="block text-[var(--text-sm)] text-[var(--color-text-secondary)] mb-[var(--space-1)]">
                Email
              </label>
              <Input
                id="create-client-email"
                type="email"
                placeholder="client@example.com"
                aria-invalid={!!createForm.formState.errors.email}
                aria-describedby={createForm.formState.errors.email ? "create-client-email-error" : undefined}
                {...createForm.register("email")}
              />
              {createForm.formState.errors.email && (
                <p id="create-client-email-error" className="text-[var(--text-xs)] text-[var(--color-error)] mt-1">
                  {createForm.formState.errors.email.message}
                </p>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="create-client-password" className="block text-[var(--text-sm)] text-[var(--color-text-secondary)] mb-[var(--space-1)]">
              Password
            </label>
            <Input
              id="create-client-password"
              type="password"
              placeholder="Min 8 characters"
              aria-invalid={!!createForm.formState.errors.password}
              aria-describedby={createForm.formState.errors.password ? "create-client-password-error" : undefined}
              {...createForm.register("password")}
            />
            {createForm.formState.errors.password && (
              <p id="create-client-password-error" className="text-[var(--text-xs)] text-[var(--color-error)] mt-1">
                {createForm.formState.errors.password.message}
              </p>
            )}
          </div>
          <div>
            <Button type="submit" disabled={createForm.formState.isSubmitting}>
              <UserPlus size={16} className="mr-1.5" />
              {createForm.formState.isSubmitting ? "Creating..." : "Create Account"}
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={inviteForm.handleSubmit(handleSendInvite)} className="flex flex-col gap-[var(--space-3)]">
          <div className="flex gap-[var(--space-3)]">
            <div className="flex-1">
              <label htmlFor="invite-email" className="sr-only">Email address</label>
              <Input
                id="invite-email"
                type="email"
                placeholder="client@example.com"
                aria-invalid={!!inviteForm.formState.errors.email}
                aria-describedby={inviteForm.formState.errors.email ? "invite-email-error" : undefined}
                {...inviteForm.register("email")}
              />
            </div>
            <Button type="submit" disabled={inviteForm.formState.isSubmitting}>
              <Send size={16} className="mr-1.5" />
              {inviteForm.formState.isSubmitting ? "Sending..." : "Send Invite"}
            </Button>
          </div>
          {inviteForm.formState.errors.email && (
            <p id="invite-email-error" className="text-[var(--text-xs)] text-[var(--color-error)]">
              {inviteForm.formState.errors.email.message}
            </p>
          )}
        </form>
      )}

      {serverError && (
        <p className="text-[var(--text-sm)] text-[var(--color-error)] mt-[var(--space-2)]">
          {serverError}
        </p>
      )}
    </Card>
  );
}
