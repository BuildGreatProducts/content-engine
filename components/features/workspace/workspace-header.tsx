"use client";

import { Menu } from "lucide-react";

interface WorkspaceHeaderProps {
  onMenuClick: () => void;
}

export function WorkspaceHeader({ onMenuClick }: WorkspaceHeaderProps) {
  return (
    <header className="md:hidden flex items-center h-14 px-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <button
        onClick={onMenuClick}
        className="p-2 rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)]"
      >
        <Menu size={18} />
      </button>
    </header>
  );
}
