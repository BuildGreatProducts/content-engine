"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const user = useQuery(api.users.me);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [user, router]);

  const onSubmit = async (data: LoginFormData) => {
    setError("");
    setIsSubmitting(true);
    try {
      await signIn("password", {
        email: data.email,
        password: data.password,
        flow: "signIn",
      });
    } catch {
      setError("Incorrect email or password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <div className="mb-[var(--space-6)]">
        <h1 className="text-[var(--text-2xl)] font-semibold text-[var(--color-text-primary)]">
          Sign in
        </h1>
        <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)] mt-[var(--space-1)]">
          Enter your credentials to continue
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[var(--space-4)]">
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
            autoComplete="current-password"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-[var(--text-xs)] text-[var(--color-error)] mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {error && (
          <p className="text-[var(--text-sm)] text-[var(--color-error)]">{error}</p>
        )}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </Card>
  );
}
