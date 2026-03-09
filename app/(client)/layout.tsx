"use client";

import { ReactNode } from "react";
import { WorkspaceSidebar } from "@/components/features/workspace/workspace-sidebar";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <WorkspaceSidebar />
      <main className="flex-1 p-[var(--space-8)] md:p-[var(--space-8)] pt-16 md:pt-[var(--space-8)]">
        {children}
      </main>
    </div>
  );
}
