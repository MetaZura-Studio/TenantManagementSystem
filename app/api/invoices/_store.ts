import type { Invoice, InvoiceLine } from "@/features/invoices/types"
import { prisma } from "@/lib/server/prisma"

type InvoiceSendMethod = "email" | "whatsapp" | "export"

function toId(raw: string) {
  const id = Number.parseInt(raw, 10)
  return Number.isFinite(id) ? id : null
}

function toIsoDateTime(value: any) {
  if (!value) return value
  return value instanceof Date ? value.toISOString() : value
}

function toIsoDateOnly(value: any) {
  if (!value) return value
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return String(value)
}

function invoiceRowToInvoice(row: any): Invoice {
  return {
    id: String(row.id),
    invoiceCode: row.invoice_code,
    tenantId: String(row.tenant_id),
    subscriptionId: String(row.subscription_id),
    periodStart: toIsoDateOnly(row.period_start) ?? "",
    periodEnd: toIsoDateOnly(row.period_end) ?? "",
    issueDate: toIsoDateOnly(row.issue_date),
    dueDate: toIsoDateOnly(row.due_date) ?? "",
    currencyCode: row.currency_code,
    totalAmount: Number(row.total_amount ?? 0),
    taxAmount: Number(row.tax ?? 0),
    discountAmount: 0,
    paidAmount: Number(row.paid_amount ?? 0),
    amountDue: Number(row.amount_due ?? 0),
    status: row.status,
    notes: row.notes ?? undefined,
    createdAt: toIsoDateTime(row.created_at),
    createdBy: row.created_by != null ? String(row.created_by) : undefined,
    updatedAt: toIsoDateTime(row.updated_at),
    updatedBy: row.updated_by != null ? String(row.updated_by) : undefined,
  }
}

function lineRowToLine(row: any): InvoiceLine {
  return {
    id: String(row.id),
    invoiceId: String(row.invoice_id),
    lineType: row.line_type,
    description: row.description,
    quantity: Number(row.qty ?? 0),
    unitPrice: Number(row.unit_price ?? 0),
    sortOrder: Number(row.sort_order ?? 0),
    createdAt: toIsoDateTime(row.created_at),
    createdBy: row.created_by != null ? String(row.created_by) : undefined,
    updatedAt: toIsoDateTime(row.updated_at),
    updatedBy: row.updated_by != null ? String(row.updated_by) : undefined,
  }
}

export async function listInvoices() {
  const rows = await prisma.invoices.findMany({ orderBy: { id: "desc" } })
  return (rows as any[]).map(invoiceRowToInvoice)
}

export async function getInvoice(invoiceId: string) {
  const id = toId(invoiceId)
  if (!id) return undefined

  const row = await prisma.invoices.findUnique({ where: { id } })
  return row ? invoiceRowToInvoice(row) : undefined
}

export async function createInvoice(
  data: Omit<Invoice, "id" | "createdAt" | "updatedAt">
) {
  const now = new Date()

  const tenantId = toId(data.tenantId)
  const subscriptionId = toId(data.subscriptionId)
  if (!tenantId || !subscriptionId) {
    throw new Error("Invalid tenantId or subscriptionId")
  }

  const invoiceNumber = data.invoiceCode
  const currencyCode = data.currencyCode || "USD"

  const totalAmount = Number(data.totalAmount ?? 0)
  const paidAmount = Number(data.paidAmount ?? 0)
  const amountDue = Number(data.amountDue ?? Math.max(0, totalAmount - paidAmount))

  const created = await prisma.invoices.create({
    data: {
      invoice_code: data.invoiceCode,
      invoice_number: invoiceNumber,
      tenant_id: tenantId,
      subscription_id: subscriptionId,
      period_start: data.periodStart ? (new Date(String(data.periodStart)) as any) : null,
      period_end: data.periodEnd ? (new Date(String(data.periodEnd)) as any) : null,
      issue_date: new Date(String(data.issueDate)) as any,
      due_date: data.dueDate ? (new Date(String(data.dueDate)) as any) : null,
      currency_code: currencyCode,
      tax: Number(data.taxAmount ?? 0) as any,
      total_amount: totalAmount as any,
      paid_amount: paidAmount as any,
      amount_due: amountDue as any,
      status: data.status,
      notes: data.notes ?? null,
      created_at: now,
      created_by: null,
      updated_at: now,
      updated_by: null,
    } as any,
  })

  return invoiceRowToInvoice(created)
}

export async function updateInvoice(invoiceId: string, updates: Partial<Invoice>) {
  const id = toId(invoiceId)
  if (!id) return undefined

  const now = new Date()

  const tenantId = updates.tenantId != null ? toId(updates.tenantId) : null
  const subscriptionId =
    updates.subscriptionId != null ? toId(updates.subscriptionId) : null

  const updated = await prisma.invoices.update({
    where: { id },
    data: {
      invoice_code: updates.invoiceCode ?? undefined,
      tenant_id: tenantId ?? undefined,
      subscription_id: subscriptionId ?? undefined,
      period_start: updates.periodStart ? (new Date(String(updates.periodStart)) as any) : undefined,
      period_end: updates.periodEnd ? (new Date(String(updates.periodEnd)) as any) : undefined,
      issue_date: updates.issueDate ? (new Date(String(updates.issueDate)) as any) : undefined,
      due_date: updates.dueDate ? (new Date(String(updates.dueDate)) as any) : undefined,
      currency_code: updates.currencyCode ?? undefined,
      tax: updates.taxAmount != null ? (Number(updates.taxAmount) as any) : undefined,
      total_amount: updates.totalAmount != null ? (Number(updates.totalAmount) as any) : undefined,
      paid_amount: updates.paidAmount != null ? (Number(updates.paidAmount) as any) : undefined,
      amount_due: updates.amountDue != null ? (Number(updates.amountDue) as any) : undefined,
      status: updates.status ?? undefined,
      notes: updates.notes ?? undefined,
      updated_at: now,
      updated_by: null,
    } as any,
  })
  return invoiceRowToInvoice(updated)
}

export async function deleteInvoice(invoiceId: string) {
  const id = toId(invoiceId)
  if (!id) return false

  const existing = await prisma.invoices.findUnique({ where: { id }, select: { id: true } })
  if (!existing) return false
  await prisma.invoice_lines.deleteMany({ where: { invoice_id: id } })
  await prisma.invoices.delete({ where: { id } })
  return true
}

export async function listInvoiceLinesByInvoiceId(invoiceId: string) {
  const id = toId(invoiceId)
  if (!id) return []
  const rows = await prisma.invoice_lines.findMany({
    where: { invoice_id: id },
    orderBy: [{ sort_order: "asc" }, { id: "asc" }],
  })
  return (rows as any[]).map(lineRowToLine)
}

export async function createInvoiceLine(
  data: Omit<InvoiceLine, "id" | "createdAt" | "updatedAt">
) {
  const invoiceId = toId(data.invoiceId)
  if (!invoiceId) throw new Error("Invalid invoiceId")

  const now = new Date()

  const qty = Number(data.quantity ?? 0)
  const unit = Number(data.unitPrice ?? 0)
  const lineAmount = qty * unit

  const created = await prisma.invoice_lines.create({
    data: {
      invoice_id: invoiceId,
      line_type: data.lineType,
      description: data.description,
      qty,
      unit_price: unit as any,
      line_amount: lineAmount as any,
      sort_order: data.sortOrder ?? null,
      created_at: now,
      created_by: null,
      updated_at: now,
      updated_by: null,
    } as any,
  })
  return lineRowToLine(created)
}

export async function updateInvoiceLine(lineId: string, updates: Partial<InvoiceLine>) {
  const id = toId(lineId)
  if (!id) return undefined

  const now = new Date()

  const existing = await prisma.invoice_lines.findUnique({ where: { id } })
  if (!existing) return undefined

  const qty = updates.quantity != null ? Number(updates.quantity) : existing.qty
  const unit = updates.unitPrice != null ? Number(updates.unitPrice) : Number(existing.unit_price)
  const lineAmount = qty * unit

  const updated = await prisma.invoice_lines.update({
    where: { id },
    data: {
      line_type: updates.lineType ?? undefined,
      description: updates.description ?? undefined,
      qty: updates.quantity != null ? qty : undefined,
      unit_price: updates.unitPrice != null ? (unit as any) : undefined,
      line_amount: (lineAmount as any),
      sort_order: updates.sortOrder ?? undefined,
      updated_at: now,
      updated_by: null,
    } as any,
  })
  return lineRowToLine(updated)
}

export async function deleteInvoiceLine(lineId: string) {
  const id = toId(lineId)
  if (!id) return false
  const existing = await prisma.invoice_lines.findUnique({ where: { id }, select: { id: true } })
  if (!existing) return false
  await prisma.invoice_lines.delete({ where: { id } })
  return true
}

export async function markInvoiceSent(args: { invoiceId: string; method: InvoiceSendMethod }) {
  // DB schema has no sentAt/sendMethod columns; record a best-effort marker in notes.
  const inv = await getInvoice(args.invoiceId)
  if (!inv) return undefined
  const marker = `Sent via ${args.method} at ${new Date().toISOString()}`
  const nextNotes = inv.notes ? `${inv.notes}\n${marker}` : marker
  return await updateInvoice(args.invoiceId, { notes: nextNotes })
}

