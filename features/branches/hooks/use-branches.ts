import { useQuery } from "@tanstack/react-query"
import { branchesApi } from "@/lib/api/branches.api"
import { queryKeys } from "@/lib/query/queryKeys"

export function useBranches() {
  return useQuery({
    queryKey: queryKeys.branches.all,
    queryFn: branchesApi.getAll,
  })
}

export function useBranch(id: string) {
  return useQuery({
    queryKey: queryKeys.branches.detail(id),
    queryFn: () => branchesApi.getById(id),
    enabled: !!id,
  })
}
