import { useQuery } from "@tanstack/react-query"

export type TenantActivityItem = {
  id: string
  actorType: string
  action: string
  entityType: string
  entityId: string
  createdAt: string
}

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init)
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const message = (data as any)?.error?.message || `Request failed (${res.status})`
    throw new Error(message)
  }
  return data as T
}

export function useTenantActivity(tenantId: string) {
  return useQuery({
    queryKey: ["tenants", tenantId, "activity"],
    queryFn: () =>
      fetchJson<TenantActivityItem[]>(
        `/api/tenants/${encodeURIComponent(tenantId)}/activity`,
        { method: "GET" }
      ),
    enabled: !!tenantId,
  })
}

