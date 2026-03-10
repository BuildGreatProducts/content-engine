"use client";

import { useState } from "react";
import { Copy, Check, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getContentType, isGenerationFailed, getFailureMessage } from "@/lib/content-types";

interface LibraryCardProps {
  type: string;
  output: string;
  createdAt: number;
  isHighPriority: boolean;
  reviewedByAdmin: boolean;
}

function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/>\s+/g, "")
    .replace(/\n+/g, " ")
    .trim();
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "...";
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function LibraryCard({
  type,
  output,
  createdAt,
  isHighPriority,
  reviewedByAdmin,
}: LibraryCardProps) {
  const [copied, setCopied] = useState(false);
  const contentType = getContentType(type);
  const isFailed = isGenerationFailed(output);
  const isEmpty = !output;
  const Icon = contentType?.icon;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const preview = isFailed
    ? getFailureMessage(output)
    : truncate(stripMarkdown(output), 200);

  return (
    <Card className="group relative flex flex-col gap-[var(--space-3)]">
      {/* Top row: type badge + date */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[var(--space-2)]">
          {Icon && (
            <Icon
              size={14}
              className="text-[var(--color-text-secondary)]"
            />
          )}
          <span className="text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
            {contentType?.name ?? type}
          </span>
        </div>
        <span className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">
          {formatDate(createdAt)}
        </span>
      </div>

      {/* Preview */}
      {isFailed ? (
        <div className="flex items-center gap-[var(--space-2)] text-[var(--color-error)]">
          <AlertTriangle size={14} />
          <p className="text-[var(--text-sm)]">
            Generation failed: {preview}
          </p>
        </div>
      ) : isEmpty ? (
        <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)] italic">
          Generating...
        </p>
      ) : (
        <p className="text-[var(--text-sm)] text-[var(--color-text-primary)] leading-relaxed">
          {preview}
        </p>
      )}

      {/* Bottom row: badges + copy */}
      <div className="flex items-center justify-between mt-auto">
        <div className="flex gap-[var(--space-2)]">
          {isHighPriority && !reviewedByAdmin && (
            <Badge variant="warning">Pending Review</Badge>
          )}
          {reviewedByAdmin && <Badge variant="success">Reviewed</Badge>}
        </div>

        {!isFailed && !isEmpty && (
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-[var(--radius-sm)] text-[var(--text-xs)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer opacity-100 md:opacity-0 md:group-hover:opacity-100"
          >
            {copied ? (
              <>
                <Check size={12} />
                Copied
              </>
            ) : (
              <>
                <Copy size={12} />
                Copy
              </>
            )}
          </button>
        )}
      </div>
    </Card>
  );
}
