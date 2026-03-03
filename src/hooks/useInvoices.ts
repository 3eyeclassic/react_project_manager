import { useQuery } from "@tanstack/react-query";
import { fetchInvoices } from "@/api/invoices";

export function useInvoices(userId: string | undefined) {
  return useQuery({
    queryKey: ["invoices", userId],
    queryFn: () => fetchInvoices(userId!),
    enabled: !!userId,
  });
}
