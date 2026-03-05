import { useMutation, useQueryClient } from "@tanstack/react-query"
import { tenantsApi } from "@/lib/api/tenants.api"
import { queryKeys } from "@/lib/query/queryKeys"

export function useDeleteTenant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => tenantsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenants.all })
    },
  })
}
