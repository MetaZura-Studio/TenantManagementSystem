import { useQuery } from "@tanstack/react-query"
import { tenantsApi } from "@/lib/api/tenants.api"
import { queryKeys } from "@/lib/query/queryKeys"

export function useTenants() {
  return useQuery({
    queryKey: queryKeys.tenants.all,
    queryFn: tenantsApi.getAll,
  })
}

export function useTenant(id: string) {
  return useQuery({
    queryKey: queryKeys.tenants.detail(id),
    queryFn: () => tenantsApi.getById(id),
    enabled: !!id,
  })
}
