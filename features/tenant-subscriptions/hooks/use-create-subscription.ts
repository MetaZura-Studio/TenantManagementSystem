import { useMutation, useQueryClient } from "@tanstack/react-query"
import { tenantSubscriptionsApi } from "@/lib/api/tenant-subscriptions.api"
import { queryKeys } from "@/lib/query/queryKeys"
import type { TenantSubscription } from "../types"

export function useCreateSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (subscription: Omit<TenantSubscription, "id" | "createdAt" | "updatedAt">) =>
      tenantSubscriptionsApi.create(subscription),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.all })
    },
  })
}
