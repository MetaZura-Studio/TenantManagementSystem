import { requirePermission, PERMISSIONS } from "@/app/api/_platform/auth"
import { jsonError, jsonOk } from "@/app/api/_platform/http"
import type { InvoiceLine } from "@/features/invoices/types"
import { createInvoiceLine, getInvoice, listInvoiceLinesByInvoiceId } from "../../_store"

export async function GET(
  _req: Request,
  { params }: { params: { invoiceId: string } }
) {
  const auth = requirePermission(PERMISSIONS.INVOICES.VIEW)
  if (!auth.ok) return auth.response

  const inv = getInvoice(params.invoiceId)
  if (!inv) return jsonError(404, "NOT_FOUND", "Invoice not found")

  return jsonOk(listInvoiceLinesByInvoiceId(params.invoiceId))
}

export async function POST(
  req: Request,
  { params }: { params: { invoiceId: string } }
) {
  const auth = requirePermission(PERMISSIONS.INVOICES.UPDATE)
  if (!auth.ok) return auth.response

  const inv = getInvoice(params.invoiceId)
  if (!inv) return jsonError(404, "NOT_FOUND", "Invoice not found")

  let body: Omit<InvoiceLine, "id" | "createdAt" | "updatedAt">
  try {
    body = (await req.json()) as Omit<InvoiceLine, "id" | "createdAt" | "updatedAt">
  } catch {
    return jsonError(400, "BAD_REQUEST", "Invalid JSON body")
  }

  if (!body?.description || !body?.lineType) {
    return jsonError(400, "BAD_REQUEST", "Missing required invoice line fields")
  }

  const created = createInvoiceLine({
    ...body,
    invoiceId: params.invoiceId,
  })
  return jsonOk(created, { status: 201 })
}

