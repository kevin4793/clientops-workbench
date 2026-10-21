export type ProductType = "理财" | "保险" | "信托" | "存款" | "基金";

export type FollowUpStatus = "待联系" | "已联系" | "待回访" | "已办结";

export type ReconciliationStatus = "matched" | "pending" | "mismatch";

export type DataMode = "demo" | "snapshot";

export interface Reconciliation {
  expectedAction: string;
  paymentStatus: "未到账" | "部分到账" | "已到账" | "待确认";
  receiptRef?: string;
  status: ReconciliationStatus;
  note?: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  label: string;
  done: boolean;
}

export interface GapItem {
  id: string;
  label: string;
  resolved: boolean;
}

export interface ClientRecord {
  id: string;
  displayName: string;
  maskedName: string;
  productType: ProductType;
  productName: string;
  contractNo: string;
  expiryDate: string;
  principalAmount: number;
  currency: "CNY";
  tags: string[];
  followUpStatus: FollowUpStatus;
  lastContactAt?: string;
  lastContactNote?: string;
  reconciliation: Reconciliation;
  timeline: TimelineEvent[];
  gaps: GapItem[];
  suggestedActions: string[];
  complianceChecks: { id: string; label: string; checked: boolean }[];
  isDrill: boolean;
}

export interface PriorityResult {
  score: number;
  reasons: string[];
  summary: string;
}

export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  action: string;
  clientId?: string;
  detail?: string;
}

export type ExpiryBucket = "today" | "week" | "overdue" | "month";
