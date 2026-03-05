import { useMutation, useQueryClient } from "@tanstack/react-query"
import { branchesApi } from "@/lib/api/branches.api"
import { queryKeys } from "@/lib/query/queryKeys"
import type { Branch } from "../types"

export function useUpdateBranch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Branch> }) =>
      branchesApi.update(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.branches.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.branches.detail(variables.id) })
    },
  })
}
