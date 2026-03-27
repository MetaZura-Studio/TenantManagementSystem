import type { Payment } from "@/features/payments/types"
import type { Invoice } from "@/features/invoices/types"
import { getInvoice, updateInvoice } from "../invoices/_store"

type Store = {
  payments: Payment[]
}

const store: Store = {
  payments: [],
}

function nowIso() {
  return new Date().toISOString()
}

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function recomputeInvoiceAfterPayment(invoiceId: string) {
  const invoice = getInvoice(invoiceId) as (Invoice | undefined) & { paidAmount?: number; amountDue?: number }
  if (!invoice) return

  const successfulTotal = store.payments
    .filter((p) => p.invoiceId === invoiceId && p.status === "SUCCESS")
    .reduce((sum, p) => sum + (Number.isFinite(p.amount) ? p.amount : 0), 0)

  const paidAmount = Math.max(0, successfulTotal)
  const amountDue = Math.max(0, (Number.isFinite(invoice.totalAmount) ? invoice.totalAmount : 0) - paidAmount)

  let status: Invoice["status"] = invoice.status
  if (invoice.status !== "CANCELLED") {
    if (amountDue <= 0) status = "PAID"
    else if (paidAmount > 0) status = "PARTIALLY_PAID"
    else status = invoice.status === "DRAFT" ? "DRAFT" : "ISSUED"
  }

  updateInvoice(invoiceId, { paidAmount, amountDue, status })
}

export function listPayments() {
  return store.payments
}

export function getPayment(paymentId: string) {
  return store.payments.find((p) => p.id === paymentId)
}

export function createPayment(
  data: Omit<Payment, "id" | "createdAt" | "updatedAt">
): Payment | { error: "INVOICE_NOT_FOUND" } {
  const inv = getInvoice(data.invoiceId)
  if (!inv) return { error: "INVOICE_NOT_FOUND" }

  const createdAt = nowIso()
  const payment: Payment = {
    ...data,
    id: id("payment"),
    createdAt,
    updatedAt: createdAt,
  }
  store.payments.unshift(payment)
  recomputeInvoiceAfterPayment(payment.invoiceId)
  return payment
}

export function updatePayment(paymentId: string, updates: Partial<Payment>) {
  const idx = store.payments.findIndex((p) => p.id === paymentId)
  if (idx < 0) return undefined
  const prev = store.payments[idx]
  const next: Payment = {
    ...prev,
    ...updates,
    id: prev.id,
    invoiceId: prev.invoiceId,
    updatedAt: nowIso(),
  }
  store.payments[idx] = next
  recomputeInvoiceAfterPayment(prev.invoiceId)
  return next
}

export function deletePayment(paymentId: string) {
  const payment = getPayment(paymentId)
  if (!payment) return false
  store.payments = store.payments.filter((p) => p.id !== paymentId)
  recomputeInvoiceAfterPayment(payment.invoiceId)
  return true
}

