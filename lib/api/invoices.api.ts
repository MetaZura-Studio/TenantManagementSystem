import type { Invoice } from "@/features/invoices/types"

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init)
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as any
    const message = data?.error?.message || `Request failed (${res.status})`
    throw new Error(message)
  }
  return (await res.json()) as T
}

export const invoicesApi = {
  getAll: async (): Promise<Invoice[]> => {
    return fetchJson<Invoice[]>("/api/invoices", { method: "GET" })
  },
  getById: async (id: string): Promise<Invoice | undefined> => {
    return fetchJson<Invoice>(`/api/invoices/${encodeURIComponent(id)}`, {
      method: "GET",
    }).catch((e) => {
      // Preserve previous API shape (undefined for not found).
      if (String(e?.message || "").toLowerCase().includes("not found")) return undefined
      throw e
    })
  },
  create: async (invoice: Omit<Invoice, "id" | "createdAt" | "updatedAt">): Promise<Invoice> => {
    return fetchJson<Invoice>("/api/invoices", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(invoice),
    })
  },
  update: async (id: string, updates: Partial<Invoice>): Promise<Invoice> => {
    return fetchJson<Invoice>(`/api/invoices/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(updates),
    })
  },
  delete: async (id: string): Promise<void> => {
    await fetchJson<{ ok: true }>(`/api/invoices/${encodeURIComponent(id)}`, {
      method: "DELETE",
    })
  },
}
