import { useMutation, useQueryClient } from "@tanstack/react-query"
import { tenantSubscriptionsApi } from "@/lib/api/tenant-subscriptions.api"
import { queryKeys } from "@/lib/query/queryKeys"

export function useDeleteSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => tenantSubscriptionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.all })
    },
  })
}
