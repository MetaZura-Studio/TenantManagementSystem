import type { Invoice, InvoiceLine } from "@/features/invoices/types"

type InvoiceSendMethod = "email" | "whatsapp" | "export"

type InvoiceInternal = Invoice & {
  sentAt?: string
  sendMethod?: InvoiceSendMethod
}

type Store = {
  invoices: InvoiceInternal[]
  invoiceLines: InvoiceLine[]
}

const store: Store = {
  invoices: [],
  invoiceLines: [],
}

function nowIso() {
  return new Date().toISOString()
}

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function listInvoices() {
  return store.invoices
}

export function getInvoice(invoiceId: string) {
  return store.invoices.find((i) => i.id === invoiceId)
}

export function createInvoice(
  data: Omit<Invoice, "id" | "createdAt" | "updatedAt">
): InvoiceInternal {
  const createdAt = nowIso()
  const inv: InvoiceInternal = {
    ...data,
    id: id("invoice"),
    createdAt,
    updatedAt: createdAt,
  }
  store.invoices.unshift(inv)
  return inv
}

export function updateInvoice(invoiceId: string, updates: Partial<Invoice>) {
  const idx = store.invoices.findIndex((i) => i.id === invoiceId)
  if (idx < 0) return undefined
  const prev = store.invoices[idx]
  const next: InvoiceInternal = {
    ...prev,
    ...updates,
    id: prev.id,
    updatedAt: nowIso(),
  }
  store.invoices[idx] = next
  return next
}

export function deleteInvoice(invoiceId: string) {
  const before = store.invoices.length
  store.invoices = store.invoices.filter((i) => i.id !== invoiceId)
  store.invoiceLines = store.invoiceLines.filter((l) => l.invoiceId !== invoiceId)
  return store.invoices.length !== before
}

export function listInvoiceLinesByInvoiceId(invoiceId: string) {
  return store.invoiceLines
    .filter((l) => l.invoiceId === invoiceId)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

export function createInvoiceLine(
  data: Omit<InvoiceLine, "id" | "createdAt" | "updatedAt">
): InvoiceLine {
  const createdAt = nowIso()
  const line: InvoiceLine = {
    ...data,
    id: id("invoice-line"),
    createdAt,
    updatedAt: createdAt,
  }
  store.invoiceLines.push(line)
  return line
}

export function updateInvoiceLine(lineId: string, updates: Partial<InvoiceLine>) {
  const idx = store.invoiceLines.findIndex((l) => l.id === lineId)
  if (idx < 0) return undefined
  const prev = store.invoiceLines[idx]
  const next: InvoiceLine = {
    ...prev,
    ...updates,
    id: prev.id,
    invoiceId: prev.invoiceId,
    updatedAt: nowIso(),
  }
  store.invoiceLines[idx] = next
  return next
}

export function deleteInvoiceLine(lineId: string) {
  const before = store.invoiceLines.length
  store.invoiceLines = store.invoiceLines.filter((l) => l.id !== lineId)
  return store.invoiceLines.length !== before
}

export function markInvoiceSent(args: {
  invoiceId: string
  method: InvoiceSendMethod
}) {
  const inv = getInvoice(args.invoiceId)
  if (!inv) return undefined
  inv.sentAt = nowIso()
  inv.sendMethod = args.method
  inv.updatedAt = nowIso()
  return inv
}

