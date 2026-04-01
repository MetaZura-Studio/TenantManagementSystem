import { requirePermission, PERMISSIONS } from "@/app/api/_platform/auth"
import { jsonError, jsonOk } from "@/app/api/_platform/http"
import type { InvoiceLine } from "@/features/invoices/types"
import {
  deleteInvoiceLine,
  getInvoice,
  listInvoiceLinesByInvoiceId,
  updateInvoiceLine,
} from "../../../_store"

export async function PATCH(
  req: Request,
  { params }: { params: { invoiceId: string; lineId: string } }
) {
  const auth = requirePermission(PERMISSIONS.INVOICES.UPDATE)
  if (!auth.ok) return auth.response

  const inv = await getInvoice(params.invoiceId)
  if (!inv) return jsonError(404, "NOT_FOUND", "Invoice not found")

  let updates: Partial<InvoiceLine>
  try {
    updates = (await req.json()) as Partial<InvoiceLine>
  } catch {
    return jsonError(400, "BAD_REQUEST", "Invalid JSON body")
  }

  const updated = await updateInvoiceLine(params.lineId, updates)
  if (!updated) return jsonError(404, "NOT_FOUND", "Invoice line not found")
  if (updated.invoiceId !== params.invoiceId) {
    return jsonError(400, "BAD_REQUEST", "Invoice line does not belong to this invoice")
  }

  return jsonOk(updated)
}

export async function DELETE(
  _req: Request,
  { params }: { params: { invoiceId: string; lineId: string } }
) {
  const auth = requirePermission(PERMISSIONS.INVOICES.UPDATE)
  if (!auth.ok) return auth.response

  const inv = await getInvoice(params.invoiceId)
  if (!inv) return jsonError(404, "NOT_FOUND", "Invoice not found")

  // Verify association (best-effort).
  const lines = await listInvoiceLinesByInvoiceId(params.invoiceId)
  const belongs = lines.some((l) => l.id === params.lineId)
  if (!belongs) return jsonError(404, "NOT_FOUND", "Invoice line not found")

  const ok = await deleteInvoiceLine(params.lineId)
  if (!ok) return jsonError(404, "NOT_FOUND", "Invoice line not found")
  return jsonOk({ ok: true })
}

