import { useMutation, useQueryClient } from "@tanstack/react-query"
import { branchesApi } from "@/lib/api/branches.api"
import { queryKeys } from "@/lib/query/queryKeys"

export function useDeleteBranch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => branchesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.branches.all })
    },
  })
}
