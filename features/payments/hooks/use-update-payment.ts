import { useMutation, useQueryClient } from "@tanstack/react-query"
import { paymentsApi } from "@/lib/api/payments.api"
import { queryKeys } from "@/lib/query/queryKeys"
import type { Payment } from "../types"

export function useUpdatePayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Payment> }) =>
      paymentsApi.update(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.detail(variables.id) })
    },
  })
}
