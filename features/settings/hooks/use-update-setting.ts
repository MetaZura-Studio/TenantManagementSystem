import { useMutation, useQueryClient } from "@tanstack/react-query"
import { settingsApi } from "@/lib/api/settings.api"
import { queryKeys } from "@/lib/query/queryKeys"

export function useUpdateSetting() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ key, value, category }: { key: string; value: string; category: string }) =>
      settingsApi.update(key, value, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.all })
    },
  })
}
