import type { InvoiceLine } from "@/features/invoices/types"

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init)
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as any
    const message = data?.error?.message || `Request failed (${res.status})`
    throw new Error(message)
  }
  return (await res.json()) as T
}

export const invoiceLinesApi = {
  getByInvoiceId: async (invoiceId: string): Promise<InvoiceLine[]> => {
    return fetchJson<InvoiceLine[]>(
      `/api/invoices/${encodeURIComponent(invoiceId)}/lines`,
      { method: "GET" }
    )
  },
  create: async (
    line: Omit<InvoiceLine, "id" | "createdAt" | "updatedAt">
  ): Promise<InvoiceLine> => {
    return fetchJson<InvoiceLine>(
      `/api/invoices/${encodeURIComponent(line.invoiceId)}/lines`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(line),
      }
    )
  },
  update: async (args: {
    invoiceId: string
    lineId: string
    updates: Partial<InvoiceLine>
  }): Promise<InvoiceLine> => {
    return fetchJson<InvoiceLine>(
      `/api/invoices/${encodeURIComponent(args.invoiceId)}/lines/${encodeURIComponent(args.lineId)}`,
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(args.updates),
      }
    )
  },
  delete: async (args: { invoiceId: string; lineId: string }): Promise<void> => {
    await fetchJson<{ ok: true }>(
      `/api/invoices/${encodeURIComponent(args.invoiceId)}/lines/${encodeURIComponent(args.lineId)}`,
      { method: "DELETE" }
    )
  },
}
