import { useMutation, useQueryClient } from "@tanstack/react-query"
import { plansApi } from "@/lib/api/plans.api"
import { queryKeys } from "@/lib/query/queryKeys"
import type { Plan } from "../types"

export function useCreatePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (plan: Omit<Plan, "id" | "createdAt" | "updatedAt">) =>
      plansApi.create(plan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.plans.all })
    },
  })
}
