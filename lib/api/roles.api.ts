import type { CreateRolePayload, Role, UpdateRolePayload } from "@/features/roles/types"

async function parseOrThrow(res: Response) {
  const data = await res.json().catch(() => null)
  if (res.ok) return data
  const msg = (data as any)?.error?.message || `Request failed (${res.status})`
  throw new Error(msg)
}

export const rolesApi = {
  getAll: async (): Promise<Role[]> => {
    const res = await fetch("/api/roles", { method: "GET" })
    return (await parseOrThrow(res)) as Role[]
  },

  getById: async (id: string): Promise<Role | undefined> => {
    const res = await fetch(`/api/roles/${encodeURIComponent(id)}`, {
      method: "GET",
    })
    return (await parseOrThrow(res)) as Role
  },

  create: async (payload: CreateRolePayload): Promise<Role> => {
    const res = await fetch("/api/roles", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    })
    return (await parseOrThrow(res)) as Role
  },

  update: async (id: string, updates: Partial<Role>): Promise<Role> => {
    const res = await fetch(`/api/roles/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(updates),
    })
    return (await parseOrThrow(res)) as Role
  },

  activate: async (id: string): Promise<Role> => {
    return rolesApi.update(id, { status: "Active" })
  },

  deactivate: async (id: string): Promise<Role> => {
    return rolesApi.update(id, { status: "Inactive" })
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`/api/roles/${encodeURIComponent(id)}`, {
      method: "DELETE",
    })
    await parseOrThrow(res)
  },
}
