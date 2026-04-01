import { requirePermission, PERMISSIONS } from "@/app/api/_platform/auth"
import { jsonError, jsonOk } from "@/app/api/_platform/http"
import { getInvoice, markInvoiceSent } from "../../_store"

type SendBody = {
  method?: "email" | "whatsapp" | "export"
}

export async function POST(
  req: Request,
  { params }: { params: { invoiceId: string } }
) {
  const auth = requirePermission(PERMISSIONS.INVOICES.UPDATE)
  if (!auth.ok) return auth.response

  const inv = await getInvoice(params.invoiceId)
  if (!inv) return jsonError(404, "NOT_FOUND", "Invoice not found")

  let body: SendBody
  try {
    body = (await req.json()) as SendBody
  } catch {
    return jsonError(400, "BAD_REQUEST", "Invalid JSON body")
  }

  const method = body.method
  if (method !== "email" && method !== "whatsapp" && method !== "export") {
    return jsonError(400, "BAD_REQUEST", "Invalid send method")
  }

  const updated = await markInvoiceSent({ invoiceId: params.invoiceId, method })
  if (!updated) return jsonError(404, "NOT_FOUND", "Invoice not found")

  return jsonOk({
    ok: true,
    invoice: updated,
    pdfUrl: `/api/invoices/${encodeURIComponent(params.invoiceId)}/pdf`,
  })
}

