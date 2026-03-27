import { requirePermission, PERMISSIONS } from "@/app/api/_platform/auth"
import { jsonError, jsonOk } from "@/app/api/_platform/http"
import type { Payment } from "@/features/payments/types"
import { createPayment, listPayments } from "./_store"

export async function GET() {
  const auth = requirePermission(PERMISSIONS.PAYMENTS.VIEW)
  if (!auth.ok) return auth.response
  return jsonOk(listPayments())
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

  const created = createPayment(body)
  if ("error" in created) {
    return jsonError(404, "NOT_FOUND", "Invoice not found")
  }
  return jsonOk(created, { status: 201 })
}

