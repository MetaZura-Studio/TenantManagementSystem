import { useMutation, useQueryClient } from "@tanstack/react-query"
import { usersApi } from "@/lib/api/users.api"
import { queryKeys } from "@/lib/query/queryKeys"
import type { User } from "../types"

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (user: Omit<User, "id" | "createdAt" | "updatedAt">) =>
      usersApi.create(user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
    },
  })
}
