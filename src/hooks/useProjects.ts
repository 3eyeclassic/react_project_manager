import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchProjects,
  fetchProjectById,
  fetchArchivedProjects,
  createProject,
  updateProject,
  updateProjectStatus,
  archiveProject,
  unarchiveProject,
  deleteProject,
  type CreateProjectInput,
  type UpdateProjectInput,
} from "@/api/projects";
import type { ProjectStatus } from "@/types/enums";

export function useProjects(userId: string | undefined) {
  return useQuery({
    queryKey: ["projects", userId],
    queryFn: () => fetchProjects(userId!),
    enabled: !!userId,
  });
}

export function useProject(
  id: string | undefined,
  userId: string | undefined
) {
  return useQuery({
    queryKey: ["projects", userId, id],
    queryFn: () => fetchProjectById(id!, userId!),
    enabled: !!userId && !!id,
  });
}

export function useArchivedProjects(userId: string | undefined) {
  return useQuery({
    queryKey: ["projects", "archived", userId],
    queryFn: () => fetchArchivedProjects(userId!),
    enabled: !!userId,
  });
}

export function useCreateProject(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProjectInput) => createProject(userId!, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateProject(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateProjectInput;
    }) => updateProject(id, userId!, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects", userId, id] });
    },
  });
}

export function useUpdateProjectStatus(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProjectStatus }) =>
      updateProjectStatus(id, userId!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useArchiveProject(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => archiveProject(id, userId!),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects", "archived"] });
      queryClient.invalidateQueries({ queryKey: ["projects", userId, id] });
    },
  });
}

export function useUnarchiveProject(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => unarchiveProject(id, userId!),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects", "archived"] });
      queryClient.invalidateQueries({ queryKey: ["projects", userId, id] });
    },
  });
}

export function useDeleteProject(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProject(id, userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
