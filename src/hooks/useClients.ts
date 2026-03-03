import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchClients,
  fetchClientById,
  createClient,
  updateClient,
  deleteClient,
  type CreateClientInput,
  type UpdateClientInput,
} from "@/api/clients";

export function useClients(userId: string | undefined) {
  return useQuery({
    queryKey: ["clients", userId],
    queryFn: () => fetchClients(userId!),
    enabled: !!userId,
  });
}

export function useClient(id: string | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: ["clients", userId, id],
    queryFn: () => fetchClientById(id!, userId!),
    enabled: !!userId && !!id,
  });
}

export function useCreateClient(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateClientInput) => createClient(userId!, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

export function useUpdateClient(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateClientInput }) =>
      updateClient(id, userId!, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["clients", userId, id] });
    },
  });
}

export function useDeleteClient(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteClient(id, userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}
