"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { getContentType, isGenerationFailed } from "@/lib/content-types";
import ReactMarkdown from "react-markdown";
import { useState } from "react";

interface ReviewCardProps {
  id: Id<"content">;
  type: string;
  output: string;
  createdAt: number;
  workspaceName: string;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ReviewCard({
  id,
  type,
  output,
  createdAt,
  workspaceName,
}: ReviewCardProps) {
  const markReviewed = useMutation(api.content.markReviewed);
  const [marking, setMarking] = useState(false);
  const contentType = getContentType(type);
  const Icon = contentType?.icon;
  const isFailed = isGenerationFailed(output);
  const isEmpty = !output;

  const handleMarkReviewed = async () => {
    setMarking(true);
    try {
      await markReviewed({ id });
    } catch {
      setMarking(false);
    }
  };

  return (
    <Card className="flex flex-col gap-[var(--space-4)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[var(--space-3)]">
          <Badge variant="warning">{workspaceName}</Badge>
          <div className="flex items-center gap-[var(--space-2)]">
            {Icon && (
              <Icon size={14} className="text-[var(--color-text-secondary)]" />
            )}
            <span className="text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
              {contentType?.name ?? type}
            </span>
          </div>
        </div>
        <span className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">
          {formatDate(createdAt)}
        </span>
      </div>

      {/* Content */}
      {isFailed ? (
        <p className="text-[var(--text-sm)] text-[var(--color-error)]">
          Generation failed
        </p>
      ) : isEmpty ? (
        <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)] italic">
          Generating...
        </p>
      ) : (
        <div className="prose prose-invert prose-sm max-w-none text-[var(--color-text-primary)] [&_h1]:text-[var(--text-xl)] [&_h1]:font-semibold [&_h2]:text-[var(--text-lg)] [&_h2]:font-medium [&_h3]:text-[var(--text-base)] [&_h3]:font-medium [&_p]:text-[var(--text-sm)] [&_p]:leading-relaxed [&_li]:text-[var(--text-sm)] [&_a]:text-[var(--color-accent)]">
          <ReactMarkdown>{output}</ReactMarkdown>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end pt-[var(--space-2)] border-t border-[var(--color-border)]">
        <Button
          size="sm"
          onClick={handleMarkReviewed}
          disabled={marking || isEmpty}
        >
          <Check size={14} className="mr-1" />
          Mark as Reviewed
        </Button>
      </div>
    </Card>
  );
}
