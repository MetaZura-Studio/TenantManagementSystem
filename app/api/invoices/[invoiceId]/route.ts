import { requirePermission, PERMISSIONS } from "@/app/api/_platform/auth"
import { jsonError, jsonOk } from "@/app/api/_platform/http"
import type { Invoice } from "@/features/invoices/types"
import { deleteInvoice, getInvoice, updateInvoice } from "../_store"

export async function GET(
  _req: Request,
  { params }: { params: { invoiceId: string } }
) {
  const auth = requirePermission(PERMISSIONS.INVOICES.VIEW)
  if (!auth.ok) return auth.response

  const inv = await getInvoice(params.invoiceId)
  if (!inv) return jsonError(404, "NOT_FOUND", "Invoice not found")
  return jsonOk(inv)
}

export async function PATCH(
  req: Request,
  { params }: { params: { invoiceId: string } }
) {
  const auth = requirePermission(PERMISSIONS.INVOICES.UPDATE)
  if (!auth.ok) return auth.response

  let updates: Partial<Invoice>
  try {
    updates = (await req.json()) as Partial<Invoice>
  } catch {
    return jsonError(400, "BAD_REQUEST", "Invalid JSON body")
  }

  const updated = await updateInvoice(params.invoiceId, updates)
  if (!updated) return jsonError(404, "NOT_FOUND", "Invoice not found")
  return jsonOk(updated)
}

export async function DELETE(
  _req: Request,
  { params }: { params: { invoiceId: string } }
) {
  const auth = requirePermission(PERMISSIONS.INVOICES.DELETE)
  if (!auth.ok) return auth.response

  const ok = await deleteInvoice(params.invoiceId)
  if (!ok) return jsonError(404, "NOT_FOUND", "Invoice not found")
  return jsonOk({ ok: true })
}

