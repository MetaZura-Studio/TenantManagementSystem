import { useMutation, useQueryClient } from "@tanstack/react-query"
import { usersApi } from "@/lib/api/users.api"
import { queryKeys } from "@/lib/query/queryKeys"
import type { User } from "../types"

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<User> }) =>
      usersApi.update({ id, ...updates }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.id) })
    },
  })
}
