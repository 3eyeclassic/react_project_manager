import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  isGoogleCalendarConnected,
  disconnectGoogleCalendar,
} from "@/api/gcal";

export function useGoogleCalendarConnection(userId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: isConnected = false, isLoading } = useQuery({
    queryKey: ["google-calendar", userId],
    queryFn: () => isGoogleCalendarConnected(),
    enabled: !!userId,
  });

  const disconnect = useMutation({
    mutationFn: () => disconnectGoogleCalendar(userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["google-calendar"] });
    },
  });

  return { isConnected, isLoading, disconnect };
}
