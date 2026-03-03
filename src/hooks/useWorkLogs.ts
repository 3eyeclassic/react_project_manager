import { useQuery } from "@tanstack/react-query";
import { fetchWorkLogs, fetchWorkLogsByProject } from "@/api/workLogs";

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
