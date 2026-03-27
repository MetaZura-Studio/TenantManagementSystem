import type { Payment } from "@/features/payments/types"

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init)
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as any
    const message = data?.error?.message || `Request failed (${res.status})`
    throw new Error(message)
  }
  return (await res.json()) as T
}

export const paymentsApi = {
  getAll: async (): Promise<Payment[]> => {
    return fetchJson<Payment[]>("/api/payments", { method: "GET" })
  },
  getById: async (id: string): Promise<Payment | undefined> => {
    return fetchJson<Payment>(`/api/payments/${encodeURIComponent(id)}`, {
      method: "GET",
    }).catch((e) => {
      if (String(e?.message || "").toLowerCase().includes("not found")) return undefined
      throw e
    })
  },
  create: async (payment: Omit<Payment, "id" | "createdAt" | "updatedAt">): Promise<Payment> => {
    return fetchJson<Payment>("/api/payments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payment),
    })
  },
  update: async (id: string, updates: Partial<Payment>): Promise<Payment> => {
    return fetchJson<Payment>(`/api/payments/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(updates),
    })
  },
  delete: async (id: string): Promise<void> => {
    await fetchJson<{ ok: true }>(`/api/payments/${encodeURIComponent(id)}`, {
      method: "DELETE",
    })
  },
}
