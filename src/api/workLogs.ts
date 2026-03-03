import { supabase } from "@/lib/supabase";
import type { WorkLog } from "@/types/database";

export async function fetchWorkLogs(
  userId: string,
  options?: { startDate?: string; endDate?: string }
): Promise<WorkLog[]> {
  let query = supabase
    .from("work_logs")
    .select("*")
    .eq("user_id", userId)
    .order("started_at", { ascending: false });

  if (options?.startDate) {
    query = query.gte("started_at", options.startDate);
  }
  if (options?.endDate) {
    query = query.lte("started_at", options.endDate);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as WorkLog[];
}

export async function fetchWorkLogsByProject(
  projectId: string,
  userId: string
): Promise<WorkLog[]> {
  const { data, error } = await supabase
    .from("work_logs")
    .select("*")
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .order("started_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as WorkLog[];
}

export interface CreateWorkLogInput {
  project_id: string;
  started_at: string;
  ended_at?: string | null;
  duration: number;
  memo?: string | null;
}

export async function createWorkLog(
  userId: string,
  input: CreateWorkLogInput
): Promise<WorkLog> {
  const { data, error } = await supabase
    .from("work_logs")
    .insert({
      user_id: userId,
      ...input,
    })
    .select()
    .single();

  if (error) throw error;
  return data as WorkLog;
}

export interface UpdateWorkLogInput {
  started_at?: string;
  ended_at?: string | null;
  duration?: number;
  memo?: string | null;
}

export async function updateWorkLog(
  id: string,
  userId: string,
  input: UpdateWorkLogInput
): Promise<WorkLog> {
  const { data, error } = await supabase
    .from("work_logs")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data as WorkLog;
}

export async function deleteWorkLog(id: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from("work_logs")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
}
