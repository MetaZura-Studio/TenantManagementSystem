import { useStore } from "../store"
import type { Invoice } from "@/features/invoices/types"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const invoicesApi = {
  getAll: async (): Promise<Invoice[]> => {
    await delay(300)
    return useStore.getState().invoices
  },
  getById: async (id: string): Promise<Invoice | undefined> => {
    await delay(200)
    return useStore.getState().invoices.find((i) => i.id === id)
  },
  create: async (invoice: Omit<Invoice, "id" | "createdAt" | "updatedAt">): Promise<Invoice> => {
    await delay(400)
    const newInvoice: Invoice = {
      ...invoice,
      id: `invoice-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    useStore.getState().addInvoice(newInvoice)
    return newInvoice
  },
  update: async (id: string, updates: Partial<Invoice>): Promise<Invoice> => {
    await delay(400)
    const invoice = useStore.getState().invoices.find((i) => i.id === id)
    if (!invoice) throw new Error("Invoice not found")
    const updated = { ...invoice, ...updates, updatedAt: new Date().toISOString() }
    useStore.getState().updateInvoice(id, updated)
    return updated
  },
  delete: async (id: string): Promise<void> => {
    await delay(300)
    useStore.getState().deleteInvoice(id)
  },
}
