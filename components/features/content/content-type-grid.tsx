"use client";

import { useRouter } from "next/navigation";
import { CONTENT_TYPES } from "@/lib/content-types";
import { Card } from "@/components/ui/card";

export function ContentTypeGrid() {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--space-4)]">
      {CONTENT_TYPES.map((type) => (
        <Card
          key={type.id}
          className="cursor-pointer transition-colors duration-[var(--transition-fast)] hover:border-[var(--color-accent)]/50"
          onClick={() => router.push(`/generate/${type.id}`)}
        >
          <div className="flex items-start gap-[var(--space-3)]">
            <div className="p-2 rounded-[var(--radius-md)] bg-[var(--color-accent)]/10">
              <type.icon size={20} className="text-[var(--color-accent)]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[var(--text-base)] font-medium text-[var(--color-text-primary)]">
                {type.name}
              </h3>
              <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)] mt-1">
                {type.description}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
