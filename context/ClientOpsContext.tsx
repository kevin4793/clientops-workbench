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
import { ensureClientShape } from "@/lib/enrich-client";
import {
  buildClientFromIntake,
  type IntakeFormValues,
} from "@/lib/build-client-from-intake";
import { loadClientsForMode, DEMO_ACTOR } from "@/lib/data-source";
import type {
  AuditEntry,
  ClientRecord,
  DataMode,
  FollowUpStatus,
  MaintenanceTaskStatus,
} from "@/lib/types";

const STORAGE_KEY = "clientops-state-v3";

function mergeSavedClients(
  saved: ClientRecord[] | undefined,
  fresh: ClientRecord[]
): ClientRecord[] {
  if (!saved?.length) return fresh;
  return fresh.map((f) => {
    const s = saved.find((x) => x.id === f.id);
    if (!s) return f;
    return {
      ...f,
      followUpStatus: s.followUpStatus,
      gaps: s.gaps,
      complianceChecks: s.complianceChecks,
      maintenanceTasks: s.maintenanceTasks,
      careReminders: s.careReminders,
      lastContactAt: s.lastContactAt,
      lastContactNote: s.lastContactNote,
      profile: s.profile ?? f.profile,
    };
  });
}

function reconcileClientList(
  saved: ClientRecord[] | undefined,
  mode: DataMode
): ClientRecord[] {
  const fresh = loadClientsForMode(mode);
  const freshIds = new Set(fresh.map((c) => c.id));
  const merged = mergeSavedClients(
    saved?.filter((c) => freshIds.has(c.id)),
    fresh
  );
  const added = (saved ?? [])
    .filter((c) => !freshIds.has(c.id))
    .map((c) => ensureClientShape(c as unknown as Record<string, unknown>));
  return [...merged, ...added];
}

interface PersistedState {
  dataMode: DataMode;
  clientsByMode: Record<DataMode, ClientRecord[]>;
  auditLog: AuditEntry[];
}

interface ClientOpsContextValue {
  dataMode: DataMode;
  setDataMode: (mode: DataMode) => void;
  clients: ClientRecord[];
  updateFollowUp: (id: string, status: FollowUpStatus) => void;
  updateComplianceCheck: (
    id: string,
    checkId: string,
    checked: boolean
  ) => void;
  updateGap: (id: string, gapId: string, resolved: boolean) => void;
  updateMaintenanceTask: (
    clientId: string,
    taskId: string,
    status: MaintenanceTaskStatus
  ) => void;
  updateCareReminder: (
    clientId: string,
    reminderId: string,
    done: boolean
  ) => void;
  getClient: (id: string) => ClientRecord | undefined;
  auditLog: AuditEntry[];
  addAudit: (action: string, clientId?: string, detail?: string) => void;
  generateTodayTodos: () => ClientRecord[];
  registerClientFromIntake: (values: IntakeFormValues) => ClientRecord;
}

const ClientOpsContext = createContext<ClientOpsContextValue | null>(null);

function defaultState(): PersistedState {
  return {
    dataMode: "demo",
    clientsByMode: {
      demo: loadClientsForMode("demo"),
      snapshot: loadClientsForMode("snapshot"),
    },
    auditLog: [
      {
        id: "audit-init",
        at: new Date("2026-10-21T09:00:00+08:00").toISOString(),
        actor: DEMO_ACTOR,
        action: "打开客户维护工作台（演示数据）",
        detail: "系统初始化审计记录",
      },
    ],
  };
}

function loadState(): PersistedState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as PersistedState;
    return {
      ...defaultState(),
      ...parsed,
      clientsByMode: {
        demo: reconcileClientList(parsed.clientsByMode?.demo, "demo"),
        snapshot: reconcileClientList(parsed.clientsByMode?.snapshot, "snapshot"),
      },
    };
  } catch {
    return defaultState();
  }
}

export function ClientOpsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(() => defaultState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const clients = state.clientsByMode[state.dataMode];

  const addAudit = useCallback(
    (action: string, clientId?: string, detail?: string) => {
      const entry: AuditEntry = {
        id: `audit-${Date.now()}`,
        at: new Date().toISOString(),
        actor: DEMO_ACTOR,
        action,
        clientId,
        detail,
      };
      setState((s) => ({ ...s, auditLog: [entry, ...s.auditLog].slice(0, 200) }));
    },
    []
  );

  const patchClient = useCallback((id: string, patch: Partial<ClientRecord>) => {
    setState((s) => {
      const list = s.clientsByMode[s.dataMode].map((c) =>
        c.id === id ? { ...c, ...patch } : c
      );
      return {
        ...s,
        clientsByMode: { ...s.clientsByMode, [s.dataMode]: list },
      };
    });
  }, []);

  const updateFollowUp = useCallback(
    (id: string, status: FollowUpStatus) => {
      patchClient(id, {
        followUpStatus: status,
        lastContactAt: new Date().toISOString().slice(0, 10),
      });
      addAudit("更新跟进状态", id, status);
    },
    [addAudit, patchClient]
  );

  const updateComplianceCheck = useCallback(
    (id: string, checkId: string, checked: boolean) => {
      setState((s) => {
        const list = s.clientsByMode[s.dataMode].map((c) => {
          if (c.id !== id) return c;
          return {
            ...c,
            complianceChecks: c.complianceChecks.map((ch) =>
              ch.id === checkId ? { ...ch, checked } : ch
            ),
          };
        });
        return {
          ...s,
          clientsByMode: { ...s.clientsByMode, [s.dataMode]: list },
        };
      });
      addAudit("合规检查项变更", id, checkId);
    },
    [addAudit]
  );

  const updateMaintenanceTask = useCallback(
    (clientId: string, taskId: string, status: MaintenanceTaskStatus) => {
      setState((s) => {
        const list = s.clientsByMode[s.dataMode].map((c) => {
          if (c.id !== clientId) return c;
          return {
            ...c,
            maintenanceTasks: c.maintenanceTasks.map((t) =>
              t.id === taskId ? { ...t, status } : t
            ),
          };
        });
        return {
          ...s,
          clientsByMode: { ...s.clientsByMode, [s.dataMode]: list },
        };
      });
      addAudit("更新维护任务", clientId, status);
    },
    [addAudit]
  );

  const updateCareReminder = useCallback(
    (clientId: string, reminderId: string, done: boolean) => {
      setState((s) => {
        const list = s.clientsByMode[s.dataMode].map((c) => {
          if (c.id !== clientId) return c;
          return {
            ...c,
            careReminders: c.careReminders.map((r) =>
              r.id === reminderId ? { ...r, done } : r
            ),
          };
        });
        return {
          ...s,
          clientsByMode: { ...s.clientsByMode, [s.dataMode]: list },
        };
      });
      addAudit("更新关怀清单", clientId, done ? "已关怀" : "待办");
    },
    [addAudit]
  );

  const updateGap = useCallback(
    (id: string, gapId: string, resolved: boolean) => {
      setState((s) => {
        const list = s.clientsByMode[s.dataMode].map((c) => {
          if (c.id !== id) return c;
          return {
            ...c,
            gaps: c.gaps.map((g) =>
              g.id === gapId ? { ...g, resolved } : g
            ),
          };
        });
        return {
          ...s,
          clientsByMode: { ...s.clientsByMode, [s.dataMode]: list },
        };
      });
      addAudit("更新缺口清单", id, gapId);
    },
    [addAudit]
  );

  const setDataMode = useCallback(
    (mode: DataMode) => {
      setState((s) => ({ ...s, dataMode: mode }));
      addAudit(
        mode === "demo" ? "切换至公开演练数据" : "切换至授权测试快照"
      );
    },
    [addAudit]
  );

  const getClient = useCallback(
    (id: string) => clients.find((c) => c.id === id),
    [clients]
  );

  const generateTodayTodos = useCallback(() => {
    return clients.filter(
      (c) =>
        c.followUpStatus !== "已办结" &&
        (c.followUpStatus === "待联系" || c.followUpStatus === "待回访")
    );
  }, [clients]);

  const registerClientFromIntake = useCallback(
    (values: IntakeFormValues) => {
      const record = buildClientFromIntake(values, state.dataMode);
      setState((s) => ({
        ...s,
        clientsByMode: {
          ...s.clientsByMode,
          [s.dataMode]: [record, ...s.clientsByMode[s.dataMode]],
        },
      }));
      addAudit("高效录入确认登记", record.id, record.displayName);
      return record;
    },
    [addAudit, state.dataMode]
  );

  const value = useMemo(
    () => ({
      dataMode: state.dataMode,
      setDataMode,
      clients,
      updateFollowUp,
      updateComplianceCheck,
      updateGap,
      updateMaintenanceTask,
      updateCareReminder,
      getClient,
      auditLog: state.auditLog,
      addAudit,
      generateTodayTodos,
      registerClientFromIntake,
    }),
    [
      state.dataMode,
      state.auditLog,
      clients,
      setDataMode,
      updateFollowUp,
      updateComplianceCheck,
      updateGap,
      updateMaintenanceTask,
      updateCareReminder,
      getClient,
      addAudit,
      generateTodayTodos,
      registerClientFromIntake,
    ]
  );

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f1f1c] text-teal-100">
        加载工作台…
      </div>
    );
  }

  return (
    <ClientOpsContext.Provider value={value}>{children}</ClientOpsContext.Provider>
  );
}

export function useClientOps() {
  const ctx = useContext(ClientOpsContext);
  if (!ctx) throw new Error("useClientOps must be used within ClientOpsProvider");
  return ctx;
}
