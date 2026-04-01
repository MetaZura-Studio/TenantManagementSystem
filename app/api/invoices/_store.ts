import type { Invoice, InvoiceLine } from "@/features/invoices/types"
import { getMysqlPool } from "@/lib/server/mysql"

type InvoiceSendMethod = "email" | "whatsapp" | "export"

function toId(raw: string) {
  const id = Number.parseInt(raw, 10)
  return Number.isFinite(id) ? id : null
}

function invoiceRowToInvoice(row: any): Invoice {
  return {
    id: String(row.id),
    invoiceCode: row.invoice_code,
    tenantId: String(row.tenant_id),
    subscriptionId: String(row.subscription_id),
    periodStart: row.period_start ?? "",
    periodEnd: row.period_end ?? "",
    issueDate: row.issue_date,
    dueDate: row.due_date ?? "",
    currencyCode: row.currency_code,
    totalAmount: Number(row.total_amount ?? 0),
    taxAmount: Number(row.tax ?? 0),
    discountAmount: 0,
    paidAmount: Number(row.paid_amount ?? 0),
    amountDue: Number(row.amount_due ?? 0),
    status: row.status,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    createdBy: row.created_by != null ? String(row.created_by) : undefined,
    updatedAt: row.updated_at,
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
    createdAt: row.created_at,
    createdBy: row.created_by != null ? String(row.created_by) : undefined,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by != null ? String(row.updated_by) : undefined,
  }
}

export async function listInvoices() {
  const pool = getMysqlPool()
  const [rows] = await pool.query(
    `
    SELECT
      id,
      invoice_code,
      tenant_id,
      subscription_id,
      period_start,
      period_end,
      issue_date,
      due_date,
      currency_code,
      tax,
      total_amount,
      paid_amount,
      amount_due,
      status,
      notes,
      created_at,
      created_by,
      updated_at,
      updated_by
    FROM invoices
    ORDER BY id DESC
    `
  )
  return (rows as any[]).map(invoiceRowToInvoice)
}

export async function getInvoice(invoiceId: string) {
  const id = toId(invoiceId)
  if (!id) return undefined

  const pool = getMysqlPool()
  const [rows] = await pool.query(
    `
    SELECT
      id,
      invoice_code,
      tenant_id,
      subscription_id,
      period_start,
      period_end,
      issue_date,
      due_date,
      currency_code,
      tax,
      total_amount,
      paid_amount,
      amount_due,
      status,
      notes,
      created_at,
      created_by,
      updated_at,
      updated_by
    FROM invoices
    WHERE id = ?
    LIMIT 1
    `,
    [id]
  )
  const row = (rows as any[])[0]
  return row ? invoiceRowToInvoice(row) : undefined
}

export async function createInvoice(
  data: Omit<Invoice, "id" | "createdAt" | "updatedAt">
) {
  const pool = getMysqlPool()
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

  const [result] = await pool.query(
    `
    INSERT INTO invoices (
      invoice_code,
      invoice_number,
      tenant_id,
      subscription_id,
      period_start,
      period_end,
      issue_date,
      due_date,
      currency_code,
      tax,
      total_amount,
      paid_amount,
      amount_due,
      status,
      notes,
      created_at,
      created_by,
      updated_at,
      updated_by
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, NULL
    )
    `,
    [
      data.invoiceCode,
      invoiceNumber,
      tenantId,
      subscriptionId,
      data.periodStart || null,
      data.periodEnd || null,
      data.issueDate,
      data.dueDate || null,
      currencyCode,
      Number(data.taxAmount ?? 0),
      totalAmount,
      paidAmount,
      amountDue,
      data.status,
      data.notes ?? null,
      now,
      now,
    ]
  )

  return (await getInvoice(String((result as any).insertId)))!
}

export async function updateInvoice(invoiceId: string, updates: Partial<Invoice>) {
  const id = toId(invoiceId)
  if (!id) return undefined

  const pool = getMysqlPool()
  const now = new Date()

  const tenantId = updates.tenantId != null ? toId(updates.tenantId) : null
  const subscriptionId =
    updates.subscriptionId != null ? toId(updates.subscriptionId) : null

  await pool.query(
    `
    UPDATE invoices
    SET
      invoice_code = COALESCE(?, invoice_code),
      tenant_id = COALESCE(?, tenant_id),
      subscription_id = COALESCE(?, subscription_id),
      period_start = COALESCE(?, period_start),
      period_end = COALESCE(?, period_end),
      issue_date = COALESCE(?, issue_date),
      due_date = COALESCE(?, due_date),
      currency_code = COALESCE(?, currency_code),
      tax = COALESCE(?, tax),
      total_amount = COALESCE(?, total_amount),
      paid_amount = COALESCE(?, paid_amount),
      amount_due = COALESCE(?, amount_due),
      status = COALESCE(?, status),
      notes = COALESCE(?, notes),
      updated_at = ?,
      updated_by = NULL
    WHERE id = ?
    `,
    [
      updates.invoiceCode ?? null,
      tenantId,
      subscriptionId,
      updates.periodStart ?? null,
      updates.periodEnd ?? null,
      updates.issueDate ?? null,
      updates.dueDate ?? null,
      updates.currencyCode ?? null,
      updates.taxAmount ?? null,
      updates.totalAmount ?? null,
      updates.paidAmount ?? null,
      updates.amountDue ?? null,
      updates.status ?? null,
      updates.notes ?? null,
      now,
      id,
    ]
  )

  return await getInvoice(String(id))
}

export async function deleteInvoice(invoiceId: string) {
  const id = toId(invoiceId)
  if (!id) return false

  const pool = getMysqlPool()
  await pool.query(`DELETE FROM invoice_lines WHERE invoice_id = ?`, [id])
  const [result] = await pool.query(`DELETE FROM invoices WHERE id = ?`, [id])
  const affected = (result as any).affectedRows ?? 0
  return affected > 0
}

export async function listInvoiceLinesByInvoiceId(invoiceId: string) {
  const id = toId(invoiceId)
  if (!id) return []
  const pool = getMysqlPool()
  const [rows] = await pool.query(
    `
    SELECT
      id,
      invoice_id,
      line_type,
      description,
      qty,
      unit_price,
      sort_order,
      created_at,
      created_by,
      updated_at,
      updated_by
    FROM invoice_lines
    WHERE invoice_id = ?
    ORDER BY COALESCE(sort_order, 0) ASC, id ASC
    `,
    [id]
  )
  return (rows as any[]).map(lineRowToLine)
}

export async function createInvoiceLine(
  data: Omit<InvoiceLine, "id" | "createdAt" | "updatedAt">
) {
  const invoiceId = toId(data.invoiceId)
  if (!invoiceId) throw new Error("Invalid invoiceId")

  const pool = getMysqlPool()
  const now = new Date()

  const qty = Number(data.quantity ?? 0)
  const unit = Number(data.unitPrice ?? 0)
  const lineAmount = qty * unit

  const [result] = await pool.query(
    `
    INSERT INTO invoice_lines (
      invoice_id,
      line_type,
      description,
      qty,
      unit_price,
      line_amount,
      sort_order,
      created_at,
      created_by,
      updated_at,
      updated_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, NULL)
    `,
    [
      invoiceId,
      data.lineType,
      data.description,
      qty,
      unit,
      lineAmount,
      data.sortOrder ?? null,
      now,
      now,
    ]
  )

  const lineId = Number((result as any).insertId)
  const [rows] = await pool.query(
    `
    SELECT
      id,
      invoice_id,
      line_type,
      description,
      qty,
      unit_price,
      sort_order,
      created_at,
      created_by,
      updated_at,
      updated_by
    FROM invoice_lines
    WHERE id = ?
    LIMIT 1
    `,
    [lineId]
  )
  const row = (rows as any[])[0]
  return lineRowToLine(row)
}

export async function updateInvoiceLine(lineId: string, updates: Partial<InvoiceLine>) {
  const id = toId(lineId)
  if (!id) return undefined

  const pool = getMysqlPool()
  const now = new Date()

  await pool.query(
    `
    UPDATE invoice_lines
    SET
      line_type = COALESCE(?, line_type),
      description = COALESCE(?, description),
      qty = COALESCE(?, qty),
      unit_price = COALESCE(?, unit_price),
      sort_order = COALESCE(?, sort_order),
      updated_at = ?,
      updated_by = NULL
    WHERE id = ?
    `,
    [
      updates.lineType ?? null,
      updates.description ?? null,
      updates.quantity ?? null,
      updates.unitPrice ?? null,
      updates.sortOrder ?? null,
      now,
      id,
    ]
  )

  const [rows] = await pool.query(
    `
    SELECT
      id,
      invoice_id,
      line_type,
      description,
      qty,
      unit_price,
      sort_order,
      created_at,
      created_by,
      updated_at,
      updated_by
    FROM invoice_lines
    WHERE id = ?
    LIMIT 1
    `,
    [id]
  )
  const row = (rows as any[])[0]
  return row ? lineRowToLine(row) : undefined
}

export async function deleteInvoiceLine(lineId: string) {
  const id = toId(lineId)
  if (!id) return false
  const pool = getMysqlPool()
  const [result] = await pool.query(`DELETE FROM invoice_lines WHERE id = ?`, [id])
  const affected = (result as any).affectedRows ?? 0
  return affected > 0
}

export async function markInvoiceSent(args: { invoiceId: string; method: InvoiceSendMethod }) {
  // DB schema has no sentAt/sendMethod columns; record a best-effort marker in notes.
  const inv = await getInvoice(args.invoiceId)
  if (!inv) return undefined
  const marker = `Sent via ${args.method} at ${new Date().toISOString()}`
  const nextNotes = inv.notes ? `${inv.notes}\n${marker}` : marker
  return await updateInvoice(args.invoiceId, { notes: nextNotes })
}

