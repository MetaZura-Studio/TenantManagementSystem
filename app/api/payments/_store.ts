import type { Payment } from "@/features/payments/types"
import { getMysqlPool } from "@/lib/server/mysql"
import { getInvoice, updateInvoice } from "../invoices/_store"

function toId(raw: string) {
  const id = Number.parseInt(raw, 10)
  return Number.isFinite(id) ? id : null
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
    transactionDate: row.transaction_date ?? row.created_at,
    paymentGatewayRef: row.transaction_id ?? undefined,
    failureReason: row.failure_reason ?? undefined,
    billingName: row.billing_name ?? undefined,
    billingEmail: row.billing_email ?? undefined,
    billingAddress: row.billing_address ?? undefined,
    createdAt: row.created_at,
    createdBy: row.created_by != null ? String(row.created_by) : undefined,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by != null ? String(row.updated_by) : undefined,
  }
}

async function recomputeInvoiceAfterPayment(invoiceId: string) {
  const invId = toId(invoiceId)
  if (!invId) return

  const invoice = await getInvoice(invoiceId)
  if (!invoice) return

  const pool = getMysqlPool()
  const [rows] = await pool.query(
    `
    SELECT COALESCE(SUM(amount), 0) AS total
    FROM payments
    WHERE invoice_id = ? AND status = 'SUCCESS'
    `,
    [invId]
  )
  const total = Number((rows as any[])[0]?.total ?? 0)

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
  const pool = getMysqlPool()
  const [rows] = await pool.query(
    `
    SELECT
      id,
      payment_code,
      payment_reference,
      transaction_id,
      tenant_id,
      invoice_id,
      subscription_id,
      payment_method,
      currency_code,
      amount,
      status,
      transaction_date,
      failure_reason,
      billing_name,
      billing_email,
      billing_address,
      created_at,
      created_by,
      updated_at,
      updated_by
    FROM payments
    ORDER BY id DESC
    `
  )
  return (rows as any[]).map(paymentRowToPayment)
}

export async function getPayment(paymentId: string) {
  const id = toId(paymentId)
  if (!id) return undefined

  const pool = getMysqlPool()
  const [rows] = await pool.query(
    `
    SELECT
      id,
      payment_code,
      payment_reference,
      transaction_id,
      tenant_id,
      invoice_id,
      subscription_id,
      payment_method,
      currency_code,
      amount,
      status,
      transaction_date,
      failure_reason,
      billing_name,
      billing_email,
      billing_address,
      created_at,
      created_by,
      updated_at,
      updated_by
    FROM payments
    WHERE id = ?
    LIMIT 1
    `,
    [id]
  )
  const row = (rows as any[])[0]
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

  const pool = getMysqlPool()
  const now = new Date()

  const [result] = await pool.query(
    `
    INSERT INTO payments (
      payment_code,
      payment_reference,
      transaction_id,
      tenant_id,
      invoice_id,
      subscription_id,
      provider,
      payment_method,
      currency_code,
      amount,
      status,
      transaction_date,
      paid_at,
      failure_reason,
      billing_name,
      billing_email,
      billing_address,
      created_at,
      created_by,
      updated_at,
      updated_by
    ) VALUES (
      ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, ?, ?, NULL, ?, ?, ?, ?, ?, NULL, ?, NULL
    )
    `,
    [
      data.paymentCode,
      data.paymentReference,
      data.paymentGatewayRef ?? null,
      tenantId,
      invoiceId,
      subscriptionId,
      data.paymentMethod,
      inv.currencyCode,
      Number(data.amount ?? 0),
      data.status,
      data.transactionDate ?? now,
      data.failureReason ?? null,
      data.billingName ?? null,
      data.billingEmail ?? null,
      data.billingAddress ?? null,
      now,
      now,
    ]
  )

  const created = await getPayment(String((result as any).insertId))
  if (created) await recomputeInvoiceAfterPayment(created.invoiceId)
  return created!
}

export async function updatePayment(paymentId: string, updates: Partial<Payment>) {
  const id = toId(paymentId)
  if (!id) return undefined

  const existing = await getPayment(paymentId)
  if (!existing) return undefined

  const pool = getMysqlPool()
  const now = new Date()

  await pool.query(
    `
    UPDATE payments
    SET
      status = COALESCE(?, status),
      amount = COALESCE(?, amount),
      failure_reason = COALESCE(?, failure_reason),
      transaction_date = COALESCE(?, transaction_date),
      updated_at = ?,
      updated_by = NULL
    WHERE id = ?
    `,
    [
      updates.status ?? null,
      updates.amount ?? null,
      updates.failureReason ?? null,
      updates.transactionDate ?? null,
      now,
      id,
    ]
  )

  const updated = await getPayment(paymentId)
  if (updated) await recomputeInvoiceAfterPayment(updated.invoiceId)
  return updated
}

export async function deletePayment(paymentId: string) {
  const existing = await getPayment(paymentId)
  if (!existing) return false

  const id = toId(paymentId)
  if (!id) return false

  const pool = getMysqlPool()
  const [result] = await pool.query(`DELETE FROM payments WHERE id = ?`, [id])
  const affected = (result as any).affectedRows ?? 0
  if (affected > 0) await recomputeInvoiceAfterPayment(existing.invoiceId)
  return affected > 0
}

