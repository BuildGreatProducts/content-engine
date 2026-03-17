"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { LayoutDashboard, ClipboardCheck, Building2, Users, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/reviews", label: "Reviews", icon: ClipboardCheck },
  { href: "/admin/workspaces", label: "Workspaces", icon: Building2 },
  { href: "/admin/clients", label: "Clients", icon: Users },
];

export function AdminLayoutGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const user = useQuery(api.users.me);

  useEffect(() => {
    if (user !== undefined && (!user || user.role !== "admin")) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  if (user === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-[var(--space-8)] md:p-[var(--space-8)] pt-16 md:pt-[var(--space-8)]">
        {children}
      </main>
    </div>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const { signOut } = useAuthActions();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.replace("/login");
  };

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="text-[var(--text-sm)] font-semibold text-[var(--color-text-primary)] mb-[var(--space-6)] flex items-center justify-between">
        <span>Admin</span>
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
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-[var(--space-3)] px-3 py-2 rounded-[var(--radius-md)] text-[var(--text-sm)] transition-colors duration-[var(--transition-fast)]",
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
        aria-controls="admin-sidebar-panel"
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
        id="admin-sidebar-panel"
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
