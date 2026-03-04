import type {
  ProjectStatus,
  SubStatus,
  Priority,
  BillingType,
  InvoiceStatus,
} from "./enums";

export interface Client {
  id: string;
  user_id: string;
  name: string | null;
  company_name: string | null;
  representative: string | null;
  billing_email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  client_id: string;
  name: string | null;
  category: string | null;
  status: ProjectStatus;
  sub_status: SubStatus | string | null;
  billing_type: BillingType;
  amount: number | null;
  hourly_rate: number | null;
  memo: string | null;
  priority: Priority;
  start_date: string | null;
  end_date: string | null;
  invoice_date: string | null;
  payment_date: string | null;
  progress: number;
  gcal_event_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkLog {
  id: string;
  user_id: string;
  project_id: string;
  started_at: string;
  ended_at: string | null;
  duration: number;
  memo: string | null;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  client_id: string;
  status: InvoiceStatus;
  amount: number | null;
  misoca_id: string | null;
  issued_at: string | null;
  sent_at: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  project_id: string;
  amount: number | null;
  created_at: string;
  updated_at: string;
}

/** 請求書 + 明細（案件ごとの金額） */
export interface InvoiceWithItems extends Invoice {
  invoice_items: InvoiceItem[];
}

/** 案件 + クライアント名（一覧・カンバン用） */
export interface ProjectWithClient extends Project {
  clients: Pick<Client, "id" | "name"> | null;
}
