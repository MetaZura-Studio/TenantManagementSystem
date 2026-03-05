import { useQuery } from "@tanstack/react-query"
import { paymentsApi } from "@/lib/api/payments.api"
import { queryKeys } from "@/lib/query/queryKeys"

export function usePayments() {
  return useQuery({
    queryKey: queryKeys.payments.all,
    queryFn: paymentsApi.getAll,
  })
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: queryKeys.payments.detail(id),
    queryFn: () => paymentsApi.getById(id),
    enabled: !!id,
  })
}
