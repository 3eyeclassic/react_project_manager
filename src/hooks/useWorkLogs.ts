import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchWorkLogs,
  fetchWorkLogsByProject,
  createWorkLog,
  type CreateWorkLogInput,
} from "@/api/workLogs";

export function useWorkLogs(
  userId: string | undefined,
  options?: { startDate?: string; endDate?: string }
) {
  return useQuery({
    queryKey: ["work_logs", userId, options?.startDate, options?.endDate],
    queryFn: () => fetchWorkLogs(userId!, options),
    enabled: !!userId,
  });
}

export function useWorkLogsByProject(
  projectId: string | undefined,
  userId: string | undefined
) {
  return useQuery({
    queryKey: ["work_logs", projectId, userId],
    queryFn: () => fetchWorkLogsByProject(projectId!, userId!),
    enabled: !!userId && !!projectId,
  });
}

export function useCreateWorkLog(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateWorkLogInput) => createWorkLog(userId!, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work_logs"] });
    },
  });
}
