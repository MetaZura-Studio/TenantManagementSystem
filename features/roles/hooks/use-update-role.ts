import { useMutation, useQueryClient } from "@tanstack/react-query"
import { rolesApi } from "@/lib/api/roles.api"
import { queryKeys } from "@/lib/query/queryKeys"
import type { Role } from "../types"

export function useUpdateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Role> }) =>
      rolesApi.update(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.detail(variables.id) })
    },
  })
}
