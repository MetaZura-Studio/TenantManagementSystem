import type { Payment } from "@/features/payments/types"
import { prisma } from "@/lib/server/prisma"
import { getInvoice, updateInvoice } from "../invoices/_store"

function toId(raw: string) {
  const id = Number.parseInt(raw, 10)
  return Number.isFinite(id) ? id : null
}

function toIsoDateTime(value: any) {
  if (!value) return value
  return value instanceof Date ? value.toISOString() : value
}

function paymentRowToPayment(row: any): Payment {
  return {
    id: String(row.id),
    paymentCode: row.payment_code,
    paymentReference: row.payment_reference,
    tenantId: String(row.tenant_id),
    invoiceId: row.invoice_id != null ? String(row.invoice_id) : "",
    subscriptionId: row.subscription_id != null ? String(row.subscription_id) : undefined,
    currencyCode: row.currency_code ?? undefined,
    amount: Number(row.amount ?? 0),
    paymentMethod: row.payment_method,
    status: row.status,
    transactionDate: toIsoDateTime(row.transaction_date ?? row.created_at),
    paymentGatewayRef: row.transaction_id ?? undefined,
    failureReason: row.failure_reason ?? undefined,
    billingName: row.billing_name ?? undefined,
    billingEmail: row.billing_email ?? undefined,
    billingAddress: row.billing_address ?? undefined,
    createdAt: toIsoDateTime(row.created_at),
    createdBy: row.created_by != null ? String(row.created_by) : undefined,
    updatedAt: toIsoDateTime(row.updated_at),
    updatedBy: row.updated_by != null ? String(row.updated_by) : undefined,
  }
}

async function recomputeInvoiceAfterPayment(invoiceId: string) {
  const invId = toId(invoiceId)
  if (!invId) return

  const invoice = await getInvoice(invoiceId)
  if (!invoice) return

  const agg = await prisma.payments.aggregate({
    where: { invoice_id: invId, status: "SUCCESS" },
    _sum: { amount: true },
  })
  const total = Number((agg as any)?._sum?.amount ?? 0)

  const paidAmount = Math.max(0, total)
  const amountDue = Math.max(0, Number(invoice.totalAmount ?? 0) - paidAmount)

  let status = invoice.status
  if (invoice.status !== "CANCELLED") {
    if (amountDue <= 0) status = "PAID"
    else if (paidAmount > 0) status = "PARTIALLY_PAID"
    else status = invoice.status === "DRAFT" ? "DRAFT" : "ISSUED"
  }

  await updateInvoice(invoiceId, { paidAmount, amountDue, status })
}

export async function listPayments() {
  const rows = await prisma.payments.findMany({ orderBy: { id: "desc" } })
  return (rows as any[]).map(paymentRowToPayment)
}

export async function getPayment(paymentId: string) {
  const id = toId(paymentId)
  if (!id) return undefined

  const row = await prisma.payments.findUnique({ where: { id } })
  return row ? paymentRowToPayment(row) : undefined
}

export async function createPayment(
  data: Omit<Payment, "id" | "createdAt" | "updatedAt">
): Promise<Payment | { error: "INVOICE_NOT_FOUND" }> {
  const inv = await getInvoice(data.invoiceId)
  if (!inv) return { error: "INVOICE_NOT_FOUND" }

  const tenantId = toId(data.tenantId)
  const invoiceId = toId(data.invoiceId)
  const subscriptionId = data.subscriptionId ? toId(data.subscriptionId) : null
  if (!tenantId || !invoiceId) return { error: "INVOICE_NOT_FOUND" }

  const now = new Date()

  const createdRow = await prisma.payments.create({
    data: {
      payment_code: data.paymentCode,
      payment_reference: data.paymentReference,
      transaction_id: data.paymentGatewayRef ?? null,
      tenant_id: tenantId,
      invoice_id: invoiceId,
      subscription_id: subscriptionId,
      provider: null,
      payment_method: data.paymentMethod,
      currency_code: inv.currencyCode,
      amount: Number(data.amount ?? 0) as any,
      status: data.status,
      transaction_date: data.transactionDate ? (new Date(String(data.transactionDate)) as any) : now,
      paid_at: null,
      failure_reason: data.failureReason ?? null,
      billing_name: data.billingName ?? null,
      billing_email: data.billingEmail ?? null,
      billing_address: data.billingAddress ?? null,
      created_at: now,
      created_by: null,
      updated_at: now,
      updated_by: null,
    } as any,
  })

  const created = paymentRowToPayment(createdRow)
  if (created) await recomputeInvoiceAfterPayment(created.invoiceId)
  return created
}

export async function updatePayment(paymentId: string, updates: Partial<Payment>) {
  const id = toId(paymentId)
  if (!id) return undefined

  const existing = await getPayment(paymentId)
  if (!existing) return undefined

  const now = new Date()

  const updatedRow = await prisma.payments.update({
    where: { id },
    data: {
      status: updates.status ?? undefined,
      amount: updates.amount != null ? (Number(updates.amount) as any) : undefined,
      failure_reason: updates.failureReason ?? undefined,
      transaction_date: updates.transactionDate
        ? (new Date(String(updates.transactionDate)) as any)
        : undefined,
      updated_at: now,
      updated_by: null,
    } as any,
  })
  const updated = paymentRowToPayment(updatedRow)
  if (updated) await recomputeInvoiceAfterPayment(updated.invoiceId)
  return updated
}

export async function deletePayment(paymentId: string) {
  const existing = await getPayment(paymentId)
  if (!existing) return false

  const id = toId(paymentId)
  if (!id) return false

  await prisma.payments.delete({ where: { id } })
  await recomputeInvoiceAfterPayment(existing.invoiceId)
  return true
}

