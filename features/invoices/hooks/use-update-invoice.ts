import { useMutation, useQueryClient } from "@tanstack/react-query"
import { invoicesApi } from "@/lib/api/invoices.api"
import { queryKeys } from "@/lib/query/queryKeys"
import type { Invoice } from "../types"

export function useUpdateInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Invoice> }) =>
      invoicesApi.update(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.detail(variables.id) })
    },
  })
}
