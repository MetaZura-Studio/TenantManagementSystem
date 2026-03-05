import { useMutation, useQueryClient } from "@tanstack/react-query"
import { currenciesApi } from "@/lib/api/currencies.api"
import { queryKeys } from "@/lib/query/queryKeys"
import type { CurrencyRate } from "../types"

export function useUpdateCurrency() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CurrencyRate> }) =>
      currenciesApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.currencies.all })
    },
  })
}
