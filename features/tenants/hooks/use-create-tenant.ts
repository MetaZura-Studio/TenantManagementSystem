import { useMutation, useQueryClient } from "@tanstack/react-query"
import { tenantsApi } from "@/lib/api/tenants.api"
import { queryKeys } from "@/lib/query/queryKeys"
import type { Tenant } from "../types"

export function useCreateTenant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      tenant: Omit<Tenant, "id" | "createdAt" | "updatedAt">
      logoFile?: File | null
    }) => tenantsApi.create(payload.tenant, payload.logoFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenants.all })
    },
  })
}
