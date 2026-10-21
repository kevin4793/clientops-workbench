export type ProductType = "理财" | "保险" | "信托" | "存款" | "基金";

/** 到期模块沿用的跟进状态 */
export type FollowUpStatus = "待联系" | "已联系" | "待回访" | "已办结";

/** 客户维护任务板状态 */
export type MaintenanceTaskStatus = "待联系" | "已约访" | "已办结";

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

/** Kevin 档案扩展字段（高效录入映射） */
export interface ClientExtendedProfile {
  dob: string;
  gender: string;
  lastBranchVisit: string;
  familySituation: string;
  household: string;
  assetRange: string;
  hobbies: string;
  quotesSaid: string;
  personality: string;
  riskTolerance: string;
  otherBanksAssets: string;
  primaryBanks: string;
}

export interface ClientProfileSummary {
  familyStructure: string;
  riskPreferenceTags: string[];
  recentContactSummary: string;
  birthday: string;
  memberSince?: string;
  extended: ClientExtendedProfile;
  productCode: string;
  contactNotes: string;
}

export interface HoldingPosition {
  id: string;
  productType: ProductType;
  productName: string;
  contractNo: string;
  principalAmount: number;
  expiryDate?: string;
  status: "持有中" | "即将到期" | "已到期";
}

export interface CareReminder {
  id: string;
  type: "生日" | "节日" | "纪念日";
  date: string;
  label: string;
  done: boolean;
}

export interface MaintenanceTask {
  id: string;
  title: string;
  dueDate?: string;
  status: MaintenanceTaskStatus;
  category: "关怀" | "到期" | "回访" | "其他";
}

export interface ServiceRecord {
  id: string;
  at: string;
  channel: "电话" | "面会" | "微信" | "短信";
  summary: string;
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
  profile: ClientProfileSummary;
  holdings: HoldingPosition[];
  careReminders: CareReminder[];
  maintenanceTasks: MaintenanceTask[];
  serviceRecords: ServiceRecord[];
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

export type NavModuleId =
  | "overview"
  | "profiles"
  | "care"
  | "holdings"
  | "tasks"
  | "timeline"
  | "talks"
  | "expiry"
  | "brief"
  | "intake";
