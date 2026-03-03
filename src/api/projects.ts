import { supabase } from "@/lib/supabase";
import type { Project, ProjectWithClient } from "@/types/database";
import type { ProjectStatus } from "@/types/enums";

export async function fetchProjects(userId: string): Promise<ProjectWithClient[]> {
  const { data, error } = await supabase
    .from("projects")
    .select(
      `
      *,
      clients ( id, name )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ProjectWithClient[];
}

export async function fetchProjectById(
  id: string,
  userId: string
): Promise<ProjectWithClient | null> {
  const { data, error } = await supabase
    .from("projects")
    .select(
      `
      *,
      clients ( id, name, company_name, billing_email, address )
    `
    )
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as ProjectWithClient;
}

export interface CreateProjectInput {
  client_id: string;
  name?: string | null;
  category?: string | null;
  status?: ProjectStatus;
  sub_status?: string | null;
  billing_type: "fixed" | "hourly";
  amount?: number | null;
  hourly_rate?: number | null;
  memo?: string | null;
  priority?: "high" | "medium" | "low";
  start_date?: string | null;
  end_date?: string | null;
  progress?: number;
}

export async function createProject(
  userId: string,
  input: CreateProjectInput
): Promise<Project> {
  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: userId,
      status: input.status ?? "not_started",
      sub_status: input.sub_status ?? null,
      priority: input.priority ?? "medium",
      progress: input.progress ?? 0,
      ...input,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Project;
}

export interface UpdateProjectInput {
  client_id?: string;
  name?: string | null;
  category?: string | null;
  status?: ProjectStatus;
  sub_status?: string | null;
  billing_type?: "fixed" | "hourly";
  amount?: number | null;
  hourly_rate?: number | null;
  memo?: string | null;
  priority?: "high" | "medium" | "low";
  start_date?: string | null;
  end_date?: string | null;
  invoice_date?: string | null;
  payment_date?: string | null;
  progress?: number;
}

export async function updateProject(
  id: string,
  userId: string,
  input: UpdateProjectInput
): Promise<Project> {
  const { data, error } = await supabase
    .from("projects")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data as Project;
}

export async function updateProjectStatus(
  id: string,
  userId: string,
  status: ProjectStatus
): Promise<Project> {
  return updateProject(id, userId, { status });
}

export async function deleteProject(id: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
}
