"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { workspaceSchema, type WorkspaceFormData } from "@/lib/validations/workspace";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { useState } from "react";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function WorkspaceForm() {
  const router = useRouter();
  const createWorkspace = useMutation(api.workspaces.create);
  const { toast } = useToast();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<WorkspaceFormData>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: { name: "", slug: "", description: "" },
  });

  const nameValue = watch("name");

  useEffect(() => {
    setValue("slug", slugify(nameValue));
  }, [nameValue, setValue]);

  const onSubmit = async (data: WorkspaceFormData) => {
    setServerError("");
    try {
      await createWorkspace({
        name: data.name,
        slug: data.slug,
        description: data.description || undefined,
      });
      toast("Workspace created", "success");
      router.push("/admin/workspaces");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create workspace";
      if (message.includes("slug already exists")) {
        setServerError("A workspace with this slug already exists.");
      } else {
        setServerError(message);
      }
    }
  };

  return (
    <Card className="max-w-lg">
      <h2 className="text-[var(--text-xl)] font-semibold text-[var(--color-text-primary)] mb-[var(--space-6)]">
        New Workspace
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[var(--space-4)]">
        <div>
          <label
            htmlFor="name"
            className="block text-[var(--text-sm)] text-[var(--color-text-secondary)] mb-[var(--space-1)]"
          >
            Name
          </label>
          <Input id="name" placeholder="Acme Corp" {...register("name")} />
          {errors.name && (
            <p className="text-[var(--text-xs)] text-[var(--color-error)] mt-1">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="slug"
            className="block text-[var(--text-sm)] text-[var(--color-text-secondary)] mb-[var(--space-1)]"
          >
            Slug
          </label>
          <Input id="slug" placeholder="acme-corp" {...register("slug")} />
          {errors.slug && (
            <p className="text-[var(--text-xs)] text-[var(--color-error)] mt-1">
              {errors.slug.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-[var(--text-sm)] text-[var(--color-text-secondary)] mb-[var(--space-1)]"
          >
            Description (optional)
          </label>
          <Textarea id="description" placeholder="Brief description..." {...register("description")} />
        </div>

        {serverError && (
          <p className="text-[var(--text-sm)] text-[var(--color-error)]">{serverError}</p>
        )}

        <div className="flex gap-[var(--space-3)]">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Workspace"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
