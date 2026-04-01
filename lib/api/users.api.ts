import type {
  User,
} from "@/features/users/types";

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const res = await fetch("/api/users", { method: "GET" })
    const data = await res.json().catch(() => null)
    if (!res.ok) throw new Error((data as any)?.error?.message || `Request failed (${res.status})`)
    return data as User[]
  },

  getById: async (id: string): Promise<User | undefined> => {
    const res = await fetch(`/api/users/${encodeURIComponent(id)}`, { method: "GET" })
    const data = await res.json().catch(() => null)
    if (!res.ok) {
      const msg = (data as any)?.error?.message || `Request failed (${res.status})`
      if (res.status === 404) return undefined
      throw new Error(msg)
    }
    return data as User
  },

  create: async (payload: any): Promise<User> => {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => null)
    if (!res.ok) throw new Error((data as any)?.error?.message || `Request failed (${res.status})`)
    return data as User
  },

  update: async (payload: any): Promise<User> => {
    const { id, ...updates } = payload
    const res = await fetch(`/api/users/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(updates),
    })
    const data = await res.json().catch(() => null)
    if (!res.ok) throw new Error((data as any)?.error?.message || `Request failed (${res.status})`)
    return data as User
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`/api/users/${encodeURIComponent(id)}`, { method: "DELETE" })
    const data = await res.json().catch(() => null)
    if (!res.ok) throw new Error((data as any)?.error?.message || `Request failed (${res.status})`)
  },
};
