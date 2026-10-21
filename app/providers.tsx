"use client";

import { ClientOpsProvider } from "@/context/ClientOpsContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return <ClientOpsProvider>{children}</ClientOpsProvider>;
}
