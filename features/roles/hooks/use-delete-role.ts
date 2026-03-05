import { useMutation, useQueryClient } from "@tanstack/react-query"
import { rolesApi } from "@/lib/api/roles.api"
import { queryKeys } from "@/lib/query/queryKeys"

export function useDeleteRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => rolesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all })
    },
  })
}
