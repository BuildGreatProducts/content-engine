"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRef, useState, useEffect } from "react";
import { getContentType } from "@/lib/content-types";
import { GenerationForm } from "@/components/features/content/generation-form";
import { ContentOutput } from "@/components/features/content/content-output";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function GeneratePage() {
  const params = useParams<{ type: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const outputRef = useRef<HTMLDivElement>(null);

  const config = getContentType(params.type);
  const workspace = useQuery(api.workspaces.getMine);
  const generateContent = useMutation(api.content.generate);

  const [contentId, setContentId] = useState<Id<"content"> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const content = useQuery(
    api.content.getById,
    contentId ? { id: contentId } : "skip"
  );

  // Derive status from output field
  const status: "generating" | "complete" | "failed" | null = content
    ? content.output === ""
      ? "generating"
      : content.output.startsWith("GENERATION_FAILED:")
        ? "failed"
        : "complete"
    : null;

  // Scroll to output when generation completes or fails
  const prevStatus = useRef(status);
  useEffect(() => {
    if (
      prevStatus.current === "generating" &&
      (status === "complete" || status === "failed")
    ) {
      outputRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevStatus.current = status;
  }, [status]);

  if (!config) {
    router.replace("/dashboard");
    return null;
  }

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (!workspace?._id) return;

    setIsGenerating(true);
    try {
      const id = await generateContent({
        workspaceId: workspace._id,
        type: config.id as Parameters<typeof generateContent>[0]["type"],
        brief: data as Record<string, string>,
        isHighPriority: config.isHighPriority,
      });
      setContentId(id);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to generate content";
      toast(message, "error");
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      <Button
        variant="secondary"
        size="sm"
        className="w-fit"
        onClick={() => router.push("/dashboard")}
      >
        <ArrowLeft size={14} className="mr-1.5" />
        Back
      </Button>

      <GenerationForm
        config={config}
        onSubmit={handleSubmit}
        isGenerating={isGenerating}
      />

      {contentId && status && (
        <div ref={outputRef}>
          <ContentOutput output={content?.output ?? ""} status={status} />
        </div>
      )}
    </div>
  );
}
