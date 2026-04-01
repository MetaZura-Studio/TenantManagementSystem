import type { Tenant } from "@/features/tenants/types"

async function parseOrThrow(res: Response) {
  const data = await res.json().catch(() => null)
  if (res.ok) return data
  const msg =
    (data as any)?.error?.message ||
    (data as any)?.message ||
    `Request failed (${res.status})`
  throw new Error(msg)
}

export const tenantsApi = {
  getAll: async (): Promise<Tenant[]> => {
    const res = await fetch("/api/tenants", { method: "GET" })
    return (await parseOrThrow(res)) as Tenant[]
  },
  getById: async (id: string): Promise<Tenant | undefined> => {
    const res = await fetch(`/api/tenants/${encodeURIComponent(id)}`, {
      method: "GET",
    })
    return (await parseOrThrow(res)) as Tenant
  },
  create: async (
    tenant: Omit<Tenant, "id" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy" | "deletedAt">
  ): Promise<Tenant> => {
    const res = await fetch("/api/tenants", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(tenant),
    })
    return (await parseOrThrow(res)) as Tenant
  },
  update: async (id: string, updates: Partial<Tenant>): Promise<Tenant> => {
    const res = await fetch(`/api/tenants/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(updates),
    })
    return (await parseOrThrow(res)) as Tenant
  },
  delete: async (id: string): Promise<void> => {
    const res = await fetch(`/api/tenants/${encodeURIComponent(id)}`, {
      method: "DELETE",
    })
    await parseOrThrow(res)
  },
}
