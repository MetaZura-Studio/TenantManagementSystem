import { useMutation, useQueryClient } from "@tanstack/react-query"
import { invoicesApi } from "@/lib/api/invoices.api"
import { queryKeys } from "@/lib/query/queryKeys"

export function useDeleteInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => invoicesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all })
    },
  })
}
