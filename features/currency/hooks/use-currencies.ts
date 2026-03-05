import { useQuery } from "@tanstack/react-query"
import { currenciesApi } from "@/lib/api/currencies.api"
import { queryKeys } from "@/lib/query/queryKeys"

export function useCurrencies() {
  return useQuery({
    queryKey: queryKeys.currencies.all,
    queryFn: currenciesApi.getAll,
  })
}
