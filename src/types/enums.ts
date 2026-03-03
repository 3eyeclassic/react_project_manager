/**
 * 案件ステータス（カンバン4列対応）
 */
export const PROJECT_STATUS = {
  NOT_STARTED: "not_started",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  PAYMENT_RECEIVED: "payment_received",
} as const;
export type ProjectStatus = (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS];

/**
 * 案件サブステータス（カード内表示用）
 */
export const SUB_STATUS = {
  IN_PROGRESS: "in_progress",
  WAITING_CLIENT: "waiting_client",
  INVOICE_READY: "invoice_ready",
  INVOICED: "invoiced",
  PAID: "paid",
} as const;
export type SubStatus = (typeof SUB_STATUS)[keyof typeof SUB_STATUS];

/**
 * 優先度
 */
export const PRIORITY = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
} as const;
export type Priority = (typeof PRIORITY)[keyof typeof PRIORITY];

/**
 * 料金体系
 */
export const BILLING_TYPE = {
  FIXED: "fixed",
  HOURLY: "hourly",
} as const;
export type BillingType = (typeof BILLING_TYPE)[keyof typeof BILLING_TYPE];

/**
 * 案件カテゴリ（プリセット + 自由入力）
 */
export const PROJECT_CATEGORY = {
  NEW_DEVELOPMENT: "新規開発",
  MAINTENANCE: "保守",
  OPERATION: "運用",
  OTHER: "その他",
} as const;
export type ProjectCategory = (typeof PROJECT_CATEGORY)[keyof typeof PROJECT_CATEGORY];

/**
 * 請求書ステータス
 */
export const INVOICE_STATUS = {
  DRAFT: "draft",
  SENT_TO_MISOCA: "sent_to_misoca",
  SENT_TO_CLIENT: "sent_to_client",
  PAID: "paid",
} as const;
export type InvoiceStatus = (typeof INVOICE_STATUS)[keyof typeof INVOICE_STATUS];

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  not_started: "未着手",
  in_progress: "進行中",
  completed: "完了",
  payment_received: "入金完了",
};

export const SUB_STATUS_LABELS: Record<SubStatus, string> = {
  in_progress: "進行中",
  waiting_client: "クライアント待ち",
  invoice_ready: "請求OK",
  invoiced: "請求済み",
  paid: "入金済み",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: "高",
  medium: "中",
  low: "低",
};

export const BILLING_TYPE_LABELS: Record<BillingType, string> = {
  fixed: "一式",
  hourly: "時間単価",
};

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "下書き",
  sent_to_misoca: "misoca送信済み",
  sent_to_client: "送付済み",
  paid: "入金済み",
};
