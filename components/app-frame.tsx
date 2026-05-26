"use client";

import { usePathname } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage =
    pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up");

  if (isAuthPage) {
    return <>{children}</>;
  }

  return <DashboardShell>{children}</DashboardShell>;
}
