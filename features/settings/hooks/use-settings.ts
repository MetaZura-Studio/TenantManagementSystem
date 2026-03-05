import { useQuery } from "@tanstack/react-query"
import { settingsApi } from "@/lib/api/settings.api"
import { queryKeys } from "@/lib/query/queryKeys"

export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings.all,
    queryFn: settingsApi.getAll,
  })
}
