import { useQuery } from "@tanstack/react-query"
import { invoicesApi } from "@/lib/api/invoices.api"
import { queryKeys } from "@/lib/query/queryKeys"

export function useInvoices() {
  return useQuery({
    queryKey: queryKeys.invoices.all,
    queryFn: invoicesApi.getAll,
  })
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: queryKeys.invoices.detail(id),
    queryFn: () => invoicesApi.getById(id),
    enabled: !!id,
  })
}
