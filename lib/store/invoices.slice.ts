import { StateCreator } from "zustand"
import type { Invoice, InvoiceLine } from "@/features/invoices/types"

export interface InvoicesSlice {
  invoices: Invoice[]
  invoiceLines: InvoiceLine[]
  setInvoices: (invoices: Invoice[]) => void
  addInvoice: (invoice: Invoice) => void
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void
  deleteInvoice: (id: string) => void
  setInvoiceLines: (lines: InvoiceLine[]) => void
  addInvoiceLine: (line: InvoiceLine) => void
  updateInvoiceLine: (id: string, line: Partial<InvoiceLine>) => void
  deleteInvoiceLine: (id: string) => void
}

export const createInvoicesSlice: StateCreator<
  InvoicesSlice,
  [],
  [],
  InvoicesSlice
> = (set) => ({
  invoices: [],
  invoiceLines: [],
  setInvoices: (invoices) => set({ invoices }),
  addInvoice: (invoice) => set((state) => ({ invoices: [...state.invoices, invoice] })),
  updateInvoice: (id, updates) =>
    set((state) => ({
      invoices: state.invoices.map((i) => (i.id === id ? { ...i, ...updates } : i)),
    })),
  deleteInvoice: (id) =>
    set((state) => ({ invoices: state.invoices.filter((i) => i.id !== id) })),
  setInvoiceLines: (lines) => set({ invoiceLines: lines }),
  addInvoiceLine: (line) =>
    set((state) => ({ invoiceLines: [...state.invoiceLines, line] })),
  updateInvoiceLine: (id, updates) =>
    set((state) => ({
      invoiceLines: state.invoiceLines.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    })),
  deleteInvoiceLine: (id) =>
    set((state) => ({ invoiceLines: state.invoiceLines.filter((l) => l.id !== id) })),
})
