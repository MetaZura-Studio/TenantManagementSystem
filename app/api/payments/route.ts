import { requirePermission, PERMISSIONS } from "@/app/api/_platform/auth"
import { jsonError, jsonOk } from "@/app/api/_platform/http"
import type { Payment } from "@/features/payments/types"
import { createPayment, listPayments } from "./_store"

export async function GET() {
  const auth = requirePermission(PERMISSIONS.PAYMENTS.VIEW)
  if (!auth.ok) return auth.response
  return jsonOk(await listPayments())
}

export async function POST(req: Request) {
  const auth = requirePermission(PERMISSIONS.PAYMENTS.CREATE)
  if (!auth.ok) return auth.response

  let body: Omit<Payment, "id" | "createdAt" | "updatedAt">
  try {
    body = (await req.json()) as Omit<Payment, "id" | "createdAt" | "updatedAt">
  } catch {
    return jsonError(400, "BAD_REQUEST", "Invalid JSON body")
  }

  if (!body?.invoiceId || !body?.tenantId || !body?.paymentCode || !body?.paymentReference) {
    return jsonError(400, "BAD_REQUEST", "Missing required payment fields")
  }

  const created = await createPayment(body)
  if (created && typeof created === "object" && "error" in created) {
    if (created.error === "INVOICE_NOT_FOUND") {
      return jsonError(404, "NOT_FOUND", "Invoice not found")
    }
    if (created.error === "OVERPAYMENT") {
      return jsonError(
        400,
        "BAD_REQUEST",
        `Payment amount exceeds remaining due. Remaining due: ${created.remaining.toFixed(2)}`
      )
    }
    return jsonError(400, "BAD_REQUEST", "Failed to create payment")
  }
  return jsonOk(created, { status: 201 })
}

