import { useQuery } from "@tanstack/react-query"
import { plansApi } from "@/lib/api/plans.api"
import { queryKeys } from "@/lib/query/queryKeys"

export function usePlans() {
  return useQuery({
    queryKey: queryKeys.plans.all,
    queryFn: plansApi.getAll,
  })
}

export function usePlan(id: string) {
  return useQuery({
    queryKey: queryKeys.plans.detail(id),
    queryFn: () => plansApi.getById(id),
    enabled: !!id,
  })
}
