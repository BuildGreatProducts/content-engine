"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
}: {
  workspaceId: Id<"workspaces">;
  type: "tone_of_voice" | "content_guidelines" | "copywriting_framework";
  title: string;
  placeholder: string;
}) {
  const doc = useQuery(api.documents.getByType, { workspaceId, type });
  const upsert = useMutation(api.documents.upsert);

  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const dirtyRef = useRef(false);
  const initializedRef = useRef(false);

  // Initialize from query, but don't overwrite dirty edits
  useEffect(() => {
    if (doc !== undefined && !dirtyRef.current) {
      setContent(doc?.content ?? "");
      initializedRef.current = true;
    }
  }, [doc]);

  const handleChange = (value: string) => {
    dirtyRef.current = true;
    setContent(value);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await upsert({ workspaceId, type, title, content });
      dirtyRef.current = false;
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save:", err);
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
        <h3 className="text-[var(--text-lg)] font-medium text-[var(--color-text-primary)]">
          {title}
        </h3>
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

export function DocumentEditor({ workspaceId }: { workspaceId: Id<"workspaces"> }) {
  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      {DOCUMENT_TYPES.map((dt) => (
        <DocumentSection
          key={dt.type}
          workspaceId={workspaceId}
          type={dt.type}
          title={dt.title}
          placeholder={dt.placeholder}
        />
      ))}
    </div>
  );
}
