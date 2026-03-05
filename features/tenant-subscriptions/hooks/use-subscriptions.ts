import { useQuery } from "@tanstack/react-query"
import { tenantSubscriptionsApi } from "@/lib/api/tenant-subscriptions.api"
import { queryKeys } from "@/lib/query/queryKeys"

export function useSubscriptions() {
  return useQuery({
    queryKey: queryKeys.subscriptions.all,
    queryFn: tenantSubscriptionsApi.getAll,
  })
}

export function useSubscription(id: string) {
  return useQuery({
    queryKey: queryKeys.subscriptions.detail(id),
    queryFn: () => tenantSubscriptionsApi.getById(id),
    enabled: !!id,
  })
}
