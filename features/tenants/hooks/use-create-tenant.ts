import { useMutation, useQueryClient } from "@tanstack/react-query"
import { tenantsApi } from "@/lib/api/tenants.api"
import { queryKeys } from "@/lib/query/queryKeys"
import type { Tenant } from "../types"

export function useCreateTenant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (tenant: Omit<Tenant, "id" | "createdAt" | "updatedAt">) =>
      tenantsApi.create(tenant),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenants.all })
    },
  })
}
