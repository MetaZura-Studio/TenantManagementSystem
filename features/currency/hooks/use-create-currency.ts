import { useMutation, useQueryClient } from "@tanstack/react-query"
import { currenciesApi } from "@/lib/api/currencies.api"
import { queryKeys } from "@/lib/query/queryKeys"

export function useCreateCurrency() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: currenciesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.currencies.all })
    },
  })
}

