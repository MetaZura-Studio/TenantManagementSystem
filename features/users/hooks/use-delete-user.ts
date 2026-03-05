import { useMutation, useQueryClient } from "@tanstack/react-query"
import { usersApi } from "@/lib/api/users.api"
import { queryKeys } from "@/lib/query/queryKeys"

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
    },
  })
}
