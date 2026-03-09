"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const setupSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SetupFormData = z.infer<typeof setupSchema>;

export function SetupForm() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const hasAdmin = useQuery(api.seed.hasAdmin);
  const promoteToAdmin = useMutation(api.seed.promoteToAdmin);
  const user = useQuery(api.users.me);

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signedUp, setSignedUp] = useState(false);
  const [promotionFailed, setPromotionFailed] = useState(false);
  const hasPromotedRef = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetupFormData>({
    resolver: zodResolver(setupSchema),
  });

  const handlePromoteToAdmin = async () => {
    setError("");
    setIsSubmitting(true);
    setPromotionFailed(false);
    try {
      await promoteToAdmin({});
      router.replace("/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set up admin account.");
      setPromotionFailed(true);
      setIsSubmitting(false);
    }
  };

  // After sign-up, once auth is established, promote to admin
  useEffect(() => {
    if (signedUp && user && !hasPromotedRef.current) {
      hasPromotedRef.current = true;
      handlePromoteToAdmin();
    }
  }, [signedUp, user]);

  // Admin already exists — redirect to login
  if (hasAdmin === true) {
    return (
      <Card className="w-full max-w-sm text-center">
        <h1 className="text-[var(--text-2xl)] font-semibold text-[var(--color-text-primary)] mb-[var(--space-2)]">
          Setup Complete
        </h1>
        <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)] mb-[var(--space-4)]">
          An admin account already exists.
        </p>
        <Button variant="secondary" onClick={() => router.push("/login")}>
          Go to Login
        </Button>
      </Card>
    );
  }

  // Still loading
  if (hasAdmin === undefined) {
    return null;
  }

  const onSubmit = async (data: SetupFormData) => {
    setError("");
    setIsSubmitting(true);
    try {
      await signIn("password", {
        email: data.email,
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

  return (
    <Card className="w-full max-w-sm">
      <div className="mb-[var(--space-6)]">
        <h1 className="text-[var(--text-2xl)] font-semibold text-[var(--color-text-primary)]">
          Admin Setup
        </h1>
        <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)] mt-[var(--space-1)]">
          Create the admin account for Content Engine
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[var(--space-4)]">
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
            htmlFor="email"
            className="block text-[var(--text-sm)] text-[var(--color-text-secondary)] mb-[var(--space-1)]"
          >
            Email
          </label>
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
          {errors.email && (
            <p className="text-[var(--text-xs)] text-[var(--color-error)] mt-1">
              {errors.email.message}
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

        {promotionFailed ? (
          <Button type="button" onClick={handlePromoteToAdmin} disabled={isSubmitting}>
            {isSubmitting ? "Retrying..." : "Retry Admin Setup"}
          </Button>
        ) : (
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Setting up..." : "Create Admin Account"}
          </Button>
        )}
      </form>
    </Card>
  );
}
