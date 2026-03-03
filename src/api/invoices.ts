import { supabase } from "@/lib/supabase";
import type { Invoice } from "@/types/database";

export async function fetchInvoices(userId: string): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Invoice[];
}

export async function fetchInvoicesByProject(
  projectId: string,
  userId: string
): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("project_id", projectId)
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

export interface CreateInvoiceInput {
  project_id: string;
  status?: "draft" | "sent_to_misoca" | "sent_to_client" | "paid";
  amount?: number | null;
  issued_at?: string | null;
  sent_at?: string | null;
  paid_at?: string | null;
}

export async function createInvoice(
  userId: string,
  input: CreateInvoiceInput
): Promise<Invoice> {
  const { data, error } = await supabase
    .from("invoices")
    .insert({
      user_id: userId,
      status: input.status ?? "draft",
      ...input,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Invoice;
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
