import { ReactNode } from "react";
import { AdminLayoutGuard } from "@/components/features/admin/admin-sidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminLayoutGuard>{children}</AdminLayoutGuard>;
}
