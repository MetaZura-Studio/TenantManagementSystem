import type { Branch } from "@/features/branches/types"

async function parseOrThrow(res: Response) {
  const data = await res.json().catch(() => null)
  if (res.ok) return data
  const msg =
    (data as any)?.error?.message ||
    (data as any)?.message ||
    `Request failed (${res.status})`
  throw new Error(msg)
}

export const branchesApi = {
  getAll: async (): Promise<Branch[]> => {
    const res = await fetch("/api/branches", { method: "GET" })
    return (await parseOrThrow(res)) as Branch[]
  },
  getById: async (id: string): Promise<Branch | undefined> => {
    const res = await fetch(`/api/branches/${encodeURIComponent(id)}`, {
      method: "GET",
    })
    return (await parseOrThrow(res)) as Branch
  },
  create: async (
    branch: Omit<Branch, "id" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy">
  ): Promise<Branch> => {
    const res = await fetch("/api/branches", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(branch),
    })
    return (await parseOrThrow(res)) as Branch
  },
  update: async (id: string, updates: Partial<Branch>): Promise<Branch> => {
    const res = await fetch(`/api/branches/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(updates),
    })
    return (await parseOrThrow(res)) as Branch
  },
  delete: async (id: string): Promise<void> => {
    const res = await fetch(`/api/branches/${encodeURIComponent(id)}`, {
      method: "DELETE",
    })
    await parseOrThrow(res)
  },
}
