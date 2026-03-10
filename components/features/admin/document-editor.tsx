"use client";

import { useState, useEffect, useRef, useId } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { Save, Check } from "lucide-react";

const DOCUMENT_TYPES = [
  { type: "tone_of_voice" as const, title: "Tone of Voice", placeholder: "Define your brand's tone of voice — personality, language style, dos and don'ts..." },
  { type: "content_guidelines" as const, title: "Content Guidelines", placeholder: "Outline your content guidelines — formatting rules, brand terms, style preferences..." },
  { type: "copywriting_framework" as const, title: "Copywriting Framework", placeholder: "Describe your copywriting framework — structure, messaging hierarchy, key principles..." },
];

function DocumentSection({
  workspaceId,
  type,
  title,
  placeholder,
  onDirtyChange,
}: {
  workspaceId: Id<"workspaces">;
  type: "tone_of_voice" | "content_guidelines" | "copywriting_framework";
  title: string;
  placeholder: string;
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const doc = useQuery(api.documents.getByType, { workspaceId, type });
  const upsert = useMutation(api.documents.upsert);
  const textareaId = useId();
  const { toast } = useToast();

  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const lastSavedContentRef = useRef("");
  const dirtyRef = useRef(false);
  const initializedRef = useRef(false);

  // Initialize from query, but don't overwrite dirty edits
  useEffect(() => {
    if (doc !== undefined && !dirtyRef.current) {
      const serverContent = doc?.content ?? "";
      setContent(serverContent);
      lastSavedContentRef.current = serverContent;
      initializedRef.current = true;
    }
  }, [doc]);

  const handleChange = (value: string) => {
    setContent(value);
    const isDirty = value !== lastSavedContentRef.current;
    if (isDirty !== dirtyRef.current) {
      dirtyRef.current = isDirty;
      onDirtyChange?.(isDirty);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await upsert({ workspaceId, type, title, content });
      lastSavedContentRef.current = content;
      dirtyRef.current = false;
      onDirtyChange?.(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save document";
      toast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (doc === undefined && !initializedRef.current) {
    return (
      <Card>
        <Skeleton className="h-6 w-48 mb-[var(--space-4)]" />
        <Skeleton className="h-[400px] w-full" />
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-[var(--space-4)]">
        <label htmlFor={textareaId} className="text-[var(--text-lg)] font-medium text-[var(--color-text-primary)]">
          {title}
        </label>
        {doc?.updatedAt && (
          <span className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">
            Last updated{" "}
            {new Date(doc.updatedAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        )}
      </div>

      <textarea
        id={textareaId}
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[var(--radius-md)] px-3 py-2 text-[var(--text-sm)] font-[family-name:var(--font-mono)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] outline-none focus:border-[var(--color-border-focus)] transition-colors resize-y"
        style={{ minHeight: "400px" }}
      />

      <div className="flex items-center justify-between mt-[var(--space-3)]">
        <span className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">
          {content.length} characters
        </span>
        <div className="flex items-center gap-[var(--space-3)]">
          {saved && (
            <span className="flex items-center gap-1 text-[var(--text-sm)] text-[var(--color-success)]">
              <Check size={14} />
              Saved
            </span>
          )}
          <Button onClick={handleSave} disabled={saving} size="sm">
            <Save size={14} className="mr-1.5" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function DocumentEditor({
  workspaceId,
  onDirtyChange,
}: {
  workspaceId: Id<"workspaces">;
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const sectionDirtyRef = useRef(new Set<string>());

  const handleSectionDirtyChange = (type: string, dirty: boolean) => {
    if (dirty) {
      sectionDirtyRef.current.add(type);
    } else {
      sectionDirtyRef.current.delete(type);
    }
    onDirtyChange?.(sectionDirtyRef.current.size > 0);
  };

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      {DOCUMENT_TYPES.map((dt) => (
        <DocumentSection
          key={`${workspaceId}-${dt.type}`}
          workspaceId={workspaceId}
          type={dt.type}
          title={dt.title}
          placeholder={dt.placeholder}
          onDirtyChange={(dirty) => handleSectionDirtyChange(dt.type, dirty)}
        />
      ))}
    </div>
  );
}
