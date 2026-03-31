import type {
  CreateTenantSubscriptionPayload,
  TenantSubscription,
  UpdateTenantSubscriptionPayload,
} from "@/features/tenant-subscriptions/types"

async function parseOrThrow(res: Response) {
  const data = await res.json().catch(() => null)
  if (res.ok) return data
  const msg =
    (data as any)?.error?.message ||
    (data as any)?.message ||
    `Request failed (${res.status})`
  throw new Error(msg)
}

export const tenantSubscriptionsApi = {
  getAll: async (): Promise<TenantSubscription[]> => {
    const res = await fetch("/api/tenant-subscriptions", { method: "GET" })
    return (await parseOrThrow(res)) as TenantSubscription[]
  },

  getById: async (id: string): Promise<TenantSubscription | undefined> => {
    const res = await fetch(
      `/api/tenant-subscriptions/${encodeURIComponent(id)}`,
      { method: "GET" }
    )
    return (await parseOrThrow(res)) as TenantSubscription
  },

  create: async (
    payload: CreateTenantSubscriptionPayload
  ): Promise<TenantSubscription> => {
    const res = await fetch("/api/tenant-subscriptions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    })
    return (await parseOrThrow(res)) as TenantSubscription
  },

  update: async (
    payload: UpdateTenantSubscriptionPayload
  ): Promise<TenantSubscription> => {
    const { id, ...updates } = payload
    const res = await fetch(
      `/api/tenant-subscriptions/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(updates),
      }
    )
    return (await parseOrThrow(res)) as TenantSubscription
  },

  activate: async (id: string): Promise<TenantSubscription> => {
    return tenantSubscriptionsApi.update({
      id,
      status: "ACTIVE",
      lockedAt: undefined,
    })
  },

  suspend: async (id: string): Promise<TenantSubscription> => {
    return tenantSubscriptionsApi.update({
      id,
      status: "SUSPENDED",
      lockedAt: new Date().toISOString(),
    })
  },

  cancel: async (id: string): Promise<TenantSubscription> => {
    const now = new Date().toISOString()

    return tenantSubscriptionsApi.update({
      id,
      status: "CANCELLED",
      cancelledAt: now,
      autoRenew: false,
    })
  },

  expire: async (id: string): Promise<TenantSubscription> => {
    return tenantSubscriptionsApi.update({
      id,
      status: "EXPIRED",
      autoRenew: false,
    })
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(
      `/api/tenant-subscriptions/${encodeURIComponent(id)}`,
      { method: "DELETE" }
    )
    await parseOrThrow(res)
  },
}
