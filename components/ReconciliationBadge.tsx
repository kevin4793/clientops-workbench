import type { Reconciliation } from "@/lib/types";

const styles: Record<Reconciliation["status"], string> = {
  matched: "bg-emerald-900/50 text-emerald-200 border-emerald-700/50",
  pending: "bg-amber-900/40 text-amber-100 border-amber-600/40",
  mismatch: "bg-rose-900/50 text-rose-100 border-rose-600/50",
};

const labels: Record<Reconciliation["status"], string> = {
  matched: "核对一致",
  pending: "待确认",
  mismatch: "差异高亮",
};

export function ReconciliationBadge({ recon }: { recon: Reconciliation }) {
  return (
    <div className="space-y-1">
      <span
        className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${styles[recon.status]}`}
      >
        到账核对 · {labels[recon.status]}
      </span>
      <p className="text-xs text-teal-200/70">
        应办：{recon.expectedAction} · 状态：{recon.paymentStatus}
      </p>
      {recon.note && (
        <p
          className={`text-xs ${
            recon.status === "mismatch" ? "text-rose-200" : "text-teal-200/60"
          }`}
        >
          {recon.note}
        </p>
      )}
    </div>
  );
}
