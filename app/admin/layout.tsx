"use client";

import { ReactNode } from "react";
import { AdminSidebar } from "@/components/features/admin/admin-sidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-[var(--space-8)] md:p-[var(--space-8)] pt-16 md:pt-[var(--space-8)]">
        {children}
      </main>
    </div>
  );
}
