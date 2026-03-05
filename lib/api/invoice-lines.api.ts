import { useStore } from "../store"
import type { InvoiceLine } from "@/features/invoices/types"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const invoiceLinesApi = {
  getByInvoiceId: async (invoiceId: string): Promise<InvoiceLine[]> => {
    await delay(200)
    return useStore.getState().invoiceLines.filter((l) => l.invoiceId === invoiceId)
  },
  create: async (
    line: Omit<InvoiceLine, "id" | "createdAt" | "updatedAt">
  ): Promise<InvoiceLine> => {
    await delay(300)
    const newLine: InvoiceLine = {
      ...line,
      id: `line-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    useStore.getState().addInvoiceLine(newLine)
    return newLine
  },
  update: async (id: string, updates: Partial<InvoiceLine>): Promise<InvoiceLine> => {
    await delay(300)
    const line = useStore.getState().invoiceLines.find((l) => l.id === id)
    if (!line) throw new Error("Invoice line not found")
    const updated = { ...line, ...updates, updatedAt: new Date().toISOString() }
    useStore.getState().updateInvoiceLine(id, updated)
    return updated
  },
  delete: async (id: string): Promise<void> => {
    await delay(200)
    useStore.getState().deleteInvoiceLine(id)
  },
}
