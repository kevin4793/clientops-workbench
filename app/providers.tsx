"use client";

import { SecureClientsProvider } from "@/context/SecureClientsContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SecureClientsProvider>{children}</SecureClientsProvider>;
}
