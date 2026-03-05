import { useMutation, useQueryClient } from "@tanstack/react-query"
import { paymentsApi } from "@/lib/api/payments.api"
import { queryKeys } from "@/lib/query/queryKeys"
import type { Payment } from "../types"

export function useCreatePayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payment: Omit<Payment, "id" | "createdAt" | "updatedAt">) =>
      paymentsApi.create(payment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all })
    },
  })
}
