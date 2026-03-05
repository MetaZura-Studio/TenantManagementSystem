import { useMutation, useQueryClient } from "@tanstack/react-query"
import { tenantsApi } from "@/lib/api/tenants.api"
import { queryKeys } from "@/lib/query/queryKeys"
import type { Tenant } from "../types"

export function useUpdateTenant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Tenant> }) =>
      tenantsApi.update(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenants.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.tenants.detail(variables.id) })
    },
  })
}
