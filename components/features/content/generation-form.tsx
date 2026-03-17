"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HighPriorityFlag } from "./high-priority-flag";
import { type ContentTypeConfig, createBriefSchema } from "@/lib/content-types";

interface GenerationFormProps {
  config: ContentTypeConfig;
  onSubmit: (data: Record<string, unknown>) => void;
  isGenerating: boolean;
}

export function GenerationForm({ config, onSubmit, isGenerating }: GenerationFormProps) {
  const schema = useMemo(() => createBriefSchema(config), [config]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onBlur",
  });

  return (
    <Card className="max-w-2xl">
      <div className="flex items-center gap-[var(--space-3)] mb-[var(--space-6)]">
        <div className="p-2 rounded-[var(--radius-md)] bg-[var(--color-accent)]/10">
          <config.icon size={20} className="text-[var(--color-accent)]" />
        </div>
        <h2 className="text-[var(--text-xl)] font-semibold text-[var(--color-text-primary)]">
          {config.name}
        </h2>
      </div>

      {config.isHighPriority && (
        <div className="mb-[var(--space-6)]">
          <HighPriorityFlag />
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[var(--space-4)]">
        {config.fields.map((field) => (
          <div key={field.name}>
            <label
              htmlFor={field.name}
              className="block text-[var(--text-sm)] text-[var(--color-text-secondary)] mb-[var(--space-1)]"
            >
              {field.label}
              {field.required && <span className="text-[var(--color-error)] ml-0.5">*</span>}
            </label>

            {field.type === "input" && (
              <Input
                id={field.name}
                placeholder={field.placeholder}
                {...register(field.name)}
              />
            )}

            {field.type === "textarea" && (
              <Textarea
                id={field.name}
                placeholder={field.placeholder}
                {...register(field.name)}
              />
            )}

            {field.type === "select" && (
              <select
                id={field.name}
                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[var(--radius-md)] px-3 py-2 text-[var(--text-base)] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-border-focus)] transition-colors duration-[var(--transition-fast)]"
                {...register(field.name)}
              >
                <option value="">Select...</option>
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}

            {errors[field.name] && (
              <p className="text-[var(--text-xs)] text-[var(--color-error)] mt-1">
                {errors[field.name]?.message as string}
              </p>
            )}
          </div>
        ))}

        <Button type="submit" disabled={isGenerating}>
          {isGenerating ? "Generating..." : "Generate Content"}
        </Button>
      </form>
    </Card>
  );
}
