import { useMutation, useQueryClient } from "@tanstack/react-query"
import { rolesApi } from "@/lib/api/roles.api"
import { queryKeys } from "@/lib/query/queryKeys"
import type { Role } from "../types"

export function useCreateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (role: Omit<Role, "id" | "createdAt" | "updatedAt">) =>
      rolesApi.create(role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all })
    },
  })
}
