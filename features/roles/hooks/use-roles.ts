import { useQuery } from "@tanstack/react-query"
import { rolesApi } from "@/lib/api/roles.api"
import { queryKeys } from "@/lib/query/queryKeys"

export function useRoles() {
  return useQuery({
    queryKey: queryKeys.roles.all,
    queryFn: rolesApi.getAll,
  })
}

export function useRole(id: string) {
  return useQuery({
    queryKey: queryKeys.roles.detail(id),
    queryFn: () => rolesApi.getById(id),
    enabled: !!id,
  })
}
