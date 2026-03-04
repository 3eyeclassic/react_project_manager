import { supabase } from "@/lib/supabase";
import type { Invoice, InvoiceItem } from "@/types/database";

export async function fetchInvoices(userId: string): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Invoice[];
}

/** ユーザーの全請求明細（ダッシュボード等で案件別金額に使う） */
export async function fetchInvoiceItemsForUser(
  userId: string
): Promise<InvoiceItem[]> {
  const { data: invoices } = await supabase
    .from("invoices")
    .select("id")
    .eq("user_id", userId);
  const ids = (invoices ?? []).map((r) => r.id);
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from("invoice_items")
    .select("*")
    .in("invoice_id", ids);

  if (error) throw error;
  return (data ?? []) as InvoiceItem[];
}

export async function fetchInvoicesByClient(
  clientId: string,
  userId: string
): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("client_id", clientId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Invoice[];
}

/** 指定案件が含まれる請求書一覧 */
export async function fetchInvoicesByProject(
  projectId: string,
  userId: string
): Promise<Invoice[]> {
  const { data: items, error: itemsError } = await supabase
    .from("invoice_items")
    .select("invoice_id")
    .eq("project_id", projectId);

  if (itemsError) throw itemsError;
  const invoiceIds = [...new Set((items ?? []).map((r) => r.invoice_id))];
  if (invoiceIds.length === 0) return [];

  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .in("id", invoiceIds)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Invoice[];
}

export async function fetchInvoiceById(
  id: string,
  userId: string
): Promise<Invoice | null> {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as Invoice;
}

export async function fetchInvoiceWithItems(
  id: string,
  userId: string
): Promise<{ invoice: Invoice; items: InvoiceItem[] } | null> {
  const invoice = await fetchInvoiceById(id, userId);
  if (!invoice) return null;

  const { data: items, error } = await supabase
    .from("invoice_items")
    .select("*")
    .eq("invoice_id", id)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return { invoice, items: (items ?? []) as InvoiceItem[] };
}

export interface CreateInvoiceInput {
  client_id: string;
  status?: "draft" | "sent_to_misoca" | "sent_to_client" | "paid";
  amount?: number | null;
  issued_at?: string | null;
  sent_at?: string | null;
  paid_at?: string | null;
}

export interface CreateInvoiceItemInput {
  project_id: string;
  amount: number | null;
}

export async function createInvoice(
  userId: string,
  input: CreateInvoiceInput,
  items: CreateInvoiceItemInput[]
): Promise<Invoice> {
  const { data: invoice, error: invError } = await supabase
    .from("invoices")
    .insert({
      user_id: userId,
      client_id: input.client_id,
      status: input.status ?? "draft",
      amount: input.amount ?? null,
      issued_at: input.issued_at ?? null,
      sent_at: input.sent_at ?? null,
      paid_at: input.paid_at ?? null,
    })
    .select()
    .single();

  if (invError) throw invError;

  if (items.length > 0) {
    const { error: itemsError } = await supabase.from("invoice_items").insert(
      items.map((item) => ({
        invoice_id: invoice.id,
        project_id: item.project_id,
        amount: item.amount,
      }))
    );
    if (itemsError) throw itemsError;
  }

  return invoice as Invoice;
}

export interface UpdateInvoiceInput {
  status?: "draft" | "sent_to_misoca" | "sent_to_client" | "paid";
  amount?: number | null;
  issued_at?: string | null;
  sent_at?: string | null;
  paid_at?: string | null;
  misoca_id?: string | null;
}

export async function updateInvoice(
  id: string,
  userId: string,
  input: UpdateInvoiceInput
): Promise<Invoice> {
  const { data, error } = await supabase
    .from("invoices")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data as Invoice;
}

export async function deleteInvoice(id: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from("invoices")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
}
