"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { SecureClient, SecureClientInput } from "@/lib/secure/types";

interface SecureClientsContextValue {
  clients: SecureClient[];
  loading: boolean;
  error: string | null;
  envReady: boolean;
  refresh: () => Promise<void>;
  saveClient: (input: SecureClientInput & { id?: string }) => Promise<SecureClient>;
  removeClient: (id: string) => Promise<void>;
}

const SecureClientsContext = createContext<SecureClientsContextValue | null>(
  null
);

export function SecureClientsProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<SecureClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [envReady, setEnvReady] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const health = await fetch("/api/health");
      const h = await health.json();
      setEnvReady(h.configured);
      if (!h.configured) {
        setError("环境变量未配置完整，请查看设置说明");
        setClients([]);
        return;
      }
      const res = await fetch("/api/clients");
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error ?? "加载失败");
      }
      const data = await res.json();
      setClients(data.clients ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const saveClient = useCallback(
    async (input: SecureClientInput & { id?: string }) => {
      const res = await fetch(
        input.id ? `/api/clients/${input.id}` : "/api/clients",
        {
          method: input.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        }
      );
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error ?? "保存失败");
      }
      const data = await res.json();
      await refresh();
      return data.client as SecureClient;
    },
    [refresh]
  );

  const removeClient = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("删除失败");
      await refresh();
    },
    [refresh]
  );

  const value = useMemo(
    () => ({
      clients,
      loading,
      error,
      envReady,
      refresh,
      saveClient,
      removeClient,
    }),
    [clients, loading, error, envReady, refresh, saveClient, removeClient]
  );

  return (
    <SecureClientsContext.Provider value={value}>
      {children}
    </SecureClientsContext.Provider>
  );
}

export function useSecureClients() {
  const ctx = useContext(SecureClientsContext);
  if (!ctx) {
    throw new Error("useSecureClients must be used within SecureClientsProvider");
  }
  return ctx;
}
