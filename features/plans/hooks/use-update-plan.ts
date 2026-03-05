import { useMutation, useQueryClient } from "@tanstack/react-query"
import { plansApi } from "@/lib/api/plans.api"
import { queryKeys } from "@/lib/query/queryKeys"
import type { Plan } from "../types"

export function useUpdatePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Plan> }) =>
      plansApi.update(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.plans.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.plans.detail(variables.id) })
    },
  })
}
