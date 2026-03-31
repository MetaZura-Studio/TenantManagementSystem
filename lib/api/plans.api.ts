import type { Plan } from "@/features/plans/types"

async function parseOrThrow(res: Response) {
  const data = await res.json().catch(() => null)
  if (res.ok) return data
  const msg =
    (data as any)?.error?.message ||
    (data as any)?.message ||
    `Request failed (${res.status})`
  throw new Error(msg)
}

export const plansApi = {
  getAll: async (): Promise<Plan[]> => {
    const res = await fetch("/api/plans", { method: "GET" })
    return (await parseOrThrow(res)) as Plan[]
  },
  getById: async (id: string): Promise<Plan | undefined> => {
    const res = await fetch(`/api/plans/${encodeURIComponent(id)}`, {
      method: "GET",
    })
    return (await parseOrThrow(res)) as Plan
  },
  create: async (plan: Omit<Plan, "id" | "createdAt" | "updatedAt">): Promise<Plan> => {
    const res = await fetch("/api/plans", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(plan),
    })
    return (await parseOrThrow(res)) as Plan
  },
  update: async (id: string, updates: Partial<Plan>): Promise<Plan> => {
    const res = await fetch(`/api/plans/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(updates),
    })
    return (await parseOrThrow(res)) as Plan
  },
  delete: async (id: string): Promise<void> => {
    const res = await fetch(`/api/plans/${encodeURIComponent(id)}`, {
      method: "DELETE",
    })
    await parseOrThrow(res)
  },
}
