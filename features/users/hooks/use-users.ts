import { useQuery } from "@tanstack/react-query"
import { usersApi } from "@/lib/api/users.api"
import { queryKeys } from "@/lib/query/queryKeys"

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users.all,
    queryFn: usersApi.getAll,
  })
}

export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => usersApi.getById(id),
    enabled: !!id,
  })
}
