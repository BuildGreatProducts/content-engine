"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Copy, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { getFailureMessage } from "@/lib/content-types";

const Markdown = dynamic(() => import("react-markdown"), { ssr: false });

interface ContentOutputProps {
  output: string;
  status: "generating" | "complete" | "failed";
  onRetry?: () => void;
}

export function ContentOutput({ output, status, onRetry }: ContentOutputProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast("Couldn't copy to clipboard. Select and copy the text manually.", "error");
    }
  };

  if (status === "generating") {
    return (
      <Card className="max-w-2xl">
        <div className="flex flex-col gap-[var(--space-3)]">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)] mt-[var(--space-4)]">
          Generating content...
        </p>
      </Card>
    );
  }

  if (status === "failed") {
    const message = getFailureMessage(output);
    return (
      <Card className="max-w-2xl border-[var(--color-error)]/30">
        <p className="text-[var(--text-sm)] text-[var(--color-error)]">
          Generation failed: {message}
        </p>
        {onRetry && (
          <Button variant="secondary" size="sm" onClick={onRetry} className="mt-[var(--space-3)]">
            Try Again
          </Button>
        )}
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl">
      <div className="flex items-center justify-between mb-[var(--space-4)]">
        <h3 className="text-[var(--text-base)] font-medium text-[var(--color-text-primary)]">
          Generated Content
        </h3>
        <Button variant="secondary" size="sm" onClick={handleCopy}>
          <span aria-live="polite">
            {copied ? (
              <>
                <Check size={14} className="mr-1.5 inline" />
                Copied
              </>
            ) : (
              <>
                <Copy size={14} className="mr-1.5 inline" />
                Copy
              </>
            )}
          </span>
        </Button>
      </div>
      <div
        className="prose-output text-[var(--text-sm)] text-[var(--color-text-primary)] leading-relaxed
          [&_h1]:text-[var(--text-xl)] [&_h1]:font-semibold [&_h1]:mt-6 [&_h1]:mb-3
          [&_h2]:text-[var(--text-lg)] [&_h2]:font-semibold [&_h2]:mt-5 [&_h2]:mb-2
          [&_h3]:text-[var(--text-base)] [&_h3]:font-medium [&_h3]:mt-4 [&_h3]:mb-2
          [&_p]:mb-3
          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3
          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3
          [&_li]:mb-1
          [&_strong]:font-semibold
          [&_blockquote]:border-l-2 [&_blockquote]:border-[var(--color-accent)] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-[var(--color-text-secondary)]"
      >
        <Markdown>{output}</Markdown>
      </div>
    </Card>
  );
}
