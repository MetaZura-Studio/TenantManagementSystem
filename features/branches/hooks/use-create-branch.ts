import { useMutation, useQueryClient } from "@tanstack/react-query"
import { branchesApi } from "@/lib/api/branches.api"
import { queryKeys } from "@/lib/query/queryKeys"
import type { Branch } from "../types"

export function useCreateBranch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (branch: Omit<Branch, "id" | "createdAt" | "updatedAt">) =>
      branchesApi.create(branch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.branches.all })
    },
  })
}
