import { useMutation, useQueryClient } from "@tanstack/react-query"
import { invoicesApi } from "@/lib/api/invoices.api"
import { queryKeys } from "@/lib/query/queryKeys"
import type { Invoice } from "../types"

export function useCreateInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (invoice: Omit<Invoice, "id" | "createdAt" | "updatedAt">) =>
      invoicesApi.create(invoice),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all })
    },
  })
}
