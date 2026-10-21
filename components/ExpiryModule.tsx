"use client";

import { useMemo, useState } from "react";
import { useClientOps } from "@/context/ClientOpsContext";
import { inExpiryBucket } from "@/lib/dates";
import { sortByPriority } from "@/lib/priority";
import type { ExpiryBucket } from "@/lib/types";
import { AuditTrail } from "./AuditTrail";
import { ClientCard } from "./ClientCard";
import { ExpiryTabs } from "./ExpiryTabs";
import { FilterBar, type BoardFilters } from "./FilterBar";
import { FollowUpPanel } from "./FollowUpPanel";
import { TalkTrackDrawer } from "./TalkTrackDrawer";

export function ExpiryModule() {
  const { clients, getClient } = useClientOps();
  const [bucket, setBucket] = useState<ExpiryBucket>("today");
  const [filters, setFilters] = useState<BoardFilters>({
    productType: "全部",
    priorityOnly: false,
    followOpenOnly: false,
  });
  const [talkClientId, setTalkClientId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<ExpiryBucket, number> = {
      today: 0,
      week: 0,
      overdue: 0,
      month: 0,
    };
    for (const client of clients) {
      (["today", "week", "overdue", "month"] as ExpiryBucket[]).forEach((b) => {
        if (inExpiryBucket(client.expiryDate, b)) c[b]++;
      });
    }
    return c;
  }, [clients]);

  const filtered = useMemo(() => {
    let list = clients.filter((c) => inExpiryBucket(c.expiryDate, bucket));
    if (filters.productType !== "全部") {
      list = list.filter((c) => c.productType === filters.productType);
    }
    if (filters.followOpenOnly) {
      list = list.filter((c) => c.followUpStatus !== "已办结");
    }
    list = sortByPriority(list);
    if (filters.priorityOnly) {
      list = list.slice(0, 5);
    }
    return list;
  }, [clients, bucket, filters]);

  const talkClient = talkClientId ? getClient(talkClientId) ?? null : null;

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <p className="rounded-xl border border-teal-800/30 bg-teal-950/30 px-3 py-2 text-xs leading-relaxed text-teal-200/80">
        到期运营模块：看板、到账核对与续期作战室。客户全生命周期维护请使用左侧其他模块。
      </p>

      <ExpiryTabs active={bucket} counts={counts} onChange={setBucket} />
      <FilterBar filters={filters} onChange={setFilters} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-teal-100">
              客户卡片（按优先级排序）
            </h2>
            {filtered[0] && (
              <button
                type="button"
                onClick={() => setTalkClientId(filtered[0].id)}
                className="text-xs text-teal-400 underline-offset-2 hover:underline"
              >
                打开 Top1 合规话术
              </button>
            )}
          </div>
          {filtered.length === 0 ? (
            <p className="rounded-xl border border-dashed border-teal-800 p-8 text-center text-sm text-teal-300/60">
              当前筛选下暂无客户，请切换日期分段或筛选条件。
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filtered.map((c, i) => (
                <ClientCard
                  key={c.id}
                  client={c}
                  rank={i + 1}
                  showPriorityReason={i === 0}
                />
              ))}
            </div>
          )}
        </div>
        <div className="space-y-4">
          <FollowUpPanel />
          <AuditTrail />
        </div>
      </div>

      <TalkTrackDrawer
        client={talkClient}
        open={!!talkClientId}
        onClose={() => setTalkClientId(null)}
      />
    </div>
  );
}
