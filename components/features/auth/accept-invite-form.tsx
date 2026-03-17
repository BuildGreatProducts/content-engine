"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  acceptInviteSchema,
  type AcceptInviteFormData,
} from "@/lib/validations/invitation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function AcceptInviteForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { signIn } = useAuthActions();
  const token = searchParams.get("token") ?? "";

  const validation = useQuery(api.invitations.validate, token ? { token } : "skip");
  const acceptInvite = useMutation(api.invitations.accept);
  const user = useQuery(api.users.me);

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signedUp, setSignedUp] = useState(false);
  const hasAcceptedRef = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptInviteFormData>({
    resolver: zodResolver(acceptInviteSchema),
    mode: "onBlur",
  });

  // After sign-up, once auth is established, accept the invitation
  useEffect(() => {
    if (signedUp && user && !hasAcceptedRef.current) {
      hasAcceptedRef.current = true;
      acceptInvite({ token })
        .then(() => {
          router.replace("/dashboard");
        })
        .catch(() => {
          hasAcceptedRef.current = false;
          setError("Failed to accept invitation. Please try again.");
          setIsSubmitting(false);
        });
    }
  }, [signedUp, user, acceptInvite, token, router]);

  const onSubmit = async (data: AcceptInviteFormData) => {
    if (!validation || !validation.valid) return;
    setError("");
    setIsSubmitting(true);
    try {
      await signIn("password", {
        email: validation.email,
        password: data.password,
        name: data.name,
        flow: "signUp",
      });
      setSignedUp(true);
    } catch {
      setError("Failed to create account. This email may already be registered.");
      setIsSubmitting(false);
    }
  };

  // Loading
  if (validation === undefined) {
    return (
      <Card className="w-full max-w-sm">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-10 w-full mb-3" />
        <Skeleton className="h-10 w-full mb-3" />
        <Skeleton className="h-10 w-full" />
      </Card>
    );
  }

  // Invalid or no token
  if (!token || !validation.valid) {
    return (
      <Card className="w-full max-w-sm text-center">
        <h1 className="text-[var(--text-2xl)] font-semibold text-[var(--color-text-primary)] mb-[var(--space-2)]">
          Invalid Invitation
        </h1>
        <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
          {validation && "reason" in validation && validation.reason === "expired"
            ? "This invitation has expired. Please contact your admin for a new one."
            : "This invitation link is invalid or has already been used."}
        </p>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <div className="mb-[var(--space-6)]">
        <h1 className="text-[var(--text-2xl)] font-semibold text-[var(--color-text-primary)]">
          Accept Invitation
        </h1>
        <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)] mt-[var(--space-1)]">
          Join <strong>{validation.workspaceName}</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[var(--space-4)]">
        <div>
          <label className="block text-[var(--text-sm)] text-[var(--color-text-secondary)] mb-[var(--space-1)]">
            Email
          </label>
          <Input value={validation.email} disabled />
        </div>

        <div>
          <label
            htmlFor="name"
            className="block text-[var(--text-sm)] text-[var(--color-text-secondary)] mb-[var(--space-1)]"
          >
            Name
          </label>
          <Input id="name" autoComplete="name" {...register("name")} />
          {errors.name && (
            <p className="text-[var(--text-xs)] text-[var(--color-error)] mt-1">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-[var(--text-sm)] text-[var(--color-text-secondary)] mb-[var(--space-1)]"
          >
            Password
          </label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-[var(--text-xs)] text-[var(--color-error)] mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-[var(--text-sm)] text-[var(--color-text-secondary)] mb-[var(--space-1)]"
          >
            Confirm Password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-[var(--text-xs)] text-[var(--color-error)] mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {error && (
          <p className="text-[var(--text-sm)] text-[var(--color-error)]">{error}</p>
        )}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </Card>
  );
}
