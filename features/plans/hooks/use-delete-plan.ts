import { useMutation, useQueryClient } from "@tanstack/react-query"
import { plansApi } from "@/lib/api/plans.api"
import { queryKeys } from "@/lib/query/queryKeys"

export function useDeletePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => plansApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.plans.all })
    },
  })
}
