"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { LayoutDashboard, BookOpen, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/library", label: "Library", icon: BookOpen },
];

export function WorkspaceSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuthActions();
  const workspace = useQuery(api.workspaces.getMine);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.replace("/login");
  };

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="mb-[var(--space-6)] flex items-center justify-between">
        <span className="text-[var(--text-sm)] font-semibold text-[var(--color-text-primary)] truncate">
          {workspace?.name ?? "Content Engine"}
        </span>
        <button
          className="md:hidden text-[var(--color-text-secondary)]"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-[var(--space-3)] px-3 py-3 md:py-2 rounded-[var(--radius-md)] text-[var(--text-sm)] transition-colors duration-[var(--transition-fast)]",
                isActive
                  ? "text-[var(--color-accent)] bg-[var(--color-accent)]/10 border-l-2 border-[var(--color-accent)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)]"
              )}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={handleSignOut}
        className="flex items-center gap-[var(--space-3)] px-3 py-2 rounded-[var(--radius-md)] text-[var(--text-sm)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)] transition-colors duration-[var(--transition-fast)] cursor-pointer"
      >
        <LogOut size={16} />
        Sign out
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)]"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
        aria-expanded={mobileOpen}
        aria-controls="workspace-sidebar-panel"
      >
        <Menu size={18} className="text-[var(--color-text-primary)]" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        id="workspace-sidebar-panel"
        aria-hidden={!mobileOpen}
        inert={!mobileOpen ? true : undefined}
        className={cn(
          "md:hidden fixed inset-y-0 left-0 z-50 w-60 bg-[var(--color-surface)] border-r border-[var(--color-border)] p-[var(--space-4)] transform transition-transform",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebar}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:block w-60 border-r border-[var(--color-border)] bg-[var(--color-surface)] p-[var(--space-4)] shrink-0">
        {sidebar}
      </aside>
    </>
  );
}
