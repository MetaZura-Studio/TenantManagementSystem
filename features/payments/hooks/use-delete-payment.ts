import { useMutation, useQueryClient } from "@tanstack/react-query"
import { paymentsApi } from "@/lib/api/payments.api"
import { queryKeys } from "@/lib/query/queryKeys"

export function useDeletePayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => paymentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all })
    },
  })
}
