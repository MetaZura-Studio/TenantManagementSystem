import { useMutation, useQueryClient } from "@tanstack/react-query"
import { tenantSubscriptionsApi } from "@/lib/api/tenant-subscriptions.api"
import { queryKeys } from "@/lib/query/queryKeys"
import type { TenantSubscription } from "../types"

export function useUpdateSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<TenantSubscription> }) =>
      tenantSubscriptionsApi.update(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.detail(variables.id) })
    },
  })
}
