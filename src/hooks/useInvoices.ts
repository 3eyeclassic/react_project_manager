import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchInvoices,
  fetchInvoiceById,
  fetchInvoiceWithItems,
  fetchInvoicesByClient,
  fetchInvoicesByProject,
  fetchInvoiceItemsForUser,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  type CreateInvoiceInput,
  type CreateInvoiceItemInput,
  type UpdateInvoiceInput,
} from "@/api/invoices";

export function useInvoices(userId: string | undefined) {
  return useQuery({
    queryKey: ["invoices", userId],
    queryFn: () => fetchInvoices(userId!),
    enabled: !!userId,
  });
}

export function useInvoiceItems(userId: string | undefined) {
  return useQuery({
    queryKey: ["invoice_items", userId],
    queryFn: () => fetchInvoiceItemsForUser(userId!),
    enabled: !!userId,
  });
}

export function useInvoicesByClient(
  clientId: string | undefined,
  userId: string | undefined
) {
  return useQuery({
    queryKey: ["invoices", userId, "client", clientId],
    queryFn: () => fetchInvoicesByClient(clientId!, userId!),
    enabled: !!userId && !!clientId,
  });
}

export function useInvoicesByProject(
  projectId: string | undefined,
  userId: string | undefined
) {
  return useQuery({
    queryKey: ["invoices", userId, "project", projectId],
    queryFn: () => fetchInvoicesByProject(projectId!, userId!),
    enabled: !!userId && !!projectId,
  });
}

export function useInvoice(id: string | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: ["invoices", userId, id],
    queryFn: () => fetchInvoiceById(id!, userId!),
    enabled: !!userId && !!id,
  });
}

export function useInvoiceWithItems(
  id: string | undefined,
  userId: string | undefined
) {
  return useQuery({
    queryKey: ["invoices", userId, id, "with_items"],
    queryFn: () => fetchInvoiceWithItems(id!, userId!),
    enabled: !!userId && !!id,
  });
}

export function useCreateInvoice(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      input,
      items,
    }: {
      input: CreateInvoiceInput;
      items: CreateInvoiceItemInput[];
    }) => createInvoice(userId!, input, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

export function useUpdateInvoice(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: { id: string; input: UpdateInvoiceInput }) =>
      updateInvoice(id, userId!, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoices", userId, id] });
    },
  });
}

export function useDeleteInvoice(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteInvoice(id, userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice_items"] });
    },
  });
}
