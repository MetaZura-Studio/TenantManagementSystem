import { requirePermission, PERMISSIONS } from "@/app/api/_platform/auth"
import { jsonError } from "@/app/api/_platform/http"
import { generateInvoicePdfBytes } from "../../_pdf"
import { getInvoice, listInvoiceLinesByInvoiceId } from "../../_store"

export async function GET(
  _req: Request,
  { params }: { params: { invoiceId: string } }
) {
  const auth = requirePermission(PERMISSIONS.INVOICES.VIEW)
  if (!auth.ok) return auth.response

  const inv = getInvoice(params.invoiceId)
  if (!inv) return jsonError(404, "NOT_FOUND", "Invoice not found")

  const lines = listInvoiceLinesByInvoiceId(params.invoiceId)
  const bytes = generateInvoicePdfBytes({ invoice: inv, lines, title: "Invoice PDF Export" })

  return new Response(bytes, {
    status: 200,
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="invoice-${encodeURIComponent(inv.invoiceCode)}.pdf"`,
      "cache-control": "no-store",
    },
  })
}

