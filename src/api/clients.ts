import { supabase } from "@/lib/supabase";
import type { Client } from "@/types/database";

export async function fetchClients(userId: string): Promise<Client[]> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", userId)
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Client[];
}

export async function fetchClientById(
  id: string,
  userId: string
): Promise<Client | null> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as Client;
}

export interface CreateClientInput {
  name?: string | null;
  company_name?: string | null;
  representative?: string | null;
  billing_email?: string | null;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
}

export async function createClient(
  userId: string,
  input: CreateClientInput
): Promise<Client> {
  const { data, error } = await supabase
    .from("clients")
    .insert({
      user_id: userId,
      ...input,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Client;
}

export type UpdateClientInput = Partial<CreateClientInput>;

export async function updateClient(
  id: string,
  userId: string,
  input: UpdateClientInput
): Promise<Client> {
  const { data, error } = await supabase
    .from("clients")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data as Client;
}

export async function deleteClient(id: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
}
