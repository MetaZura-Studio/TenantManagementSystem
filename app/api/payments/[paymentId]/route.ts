import { requirePermission, PERMISSIONS } from "@/app/api/_platform/auth"
import { jsonError, jsonOk } from "@/app/api/_platform/http"
import type { Payment } from "@/features/payments/types"
import { deletePayment, getPayment, updatePayment } from "../_store"

export async function GET(
  _req: Request,
  { params }: { params: { paymentId: string } }
) {
  const auth = requirePermission(PERMISSIONS.PAYMENTS.VIEW)
  if (!auth.ok) return auth.response

  const payment = await getPayment(params.paymentId)
  if (!payment) return jsonError(404, "NOT_FOUND", "Payment not found")
  return jsonOk(payment)
}

export async function PATCH(
  req: Request,
  { params }: { params: { paymentId: string } }
) {
  const auth = requirePermission(PERMISSIONS.PAYMENTS.UPDATE)
  if (!auth.ok) return auth.response

  let updates: Partial<Payment>
  try {
    updates = (await req.json()) as Partial<Payment>
  } catch {
    return jsonError(400, "BAD_REQUEST", "Invalid JSON body")
  }

  let updated: Payment | undefined
  try {
    updated = await updatePayment(params.paymentId, updates)
  } catch (err: any) {
    const msg = String(err?.message ?? "")
    if (msg.startsWith("OVERPAYMENT:")) {
      const remainingStr = msg.split("remaining=")[1] ?? ""
      const remaining = Number.parseFloat(remainingStr)
      const pretty = Number.isFinite(remaining) ? remaining.toFixed(2) : "0.00"
      return jsonError(
        400,
        "BAD_REQUEST",
        `Payment amount exceeds remaining due. Remaining due: ${pretty}`
      )
    }
    return jsonError(400, "BAD_REQUEST", err?.message ?? "Failed to update payment")
  }
  if (!updated) return jsonError(404, "NOT_FOUND", "Payment not found")
  return jsonOk(updated)
}

export async function DELETE(
  _req: Request,
  { params }: { params: { paymentId: string } }
) {
  const auth = requirePermission(PERMISSIONS.PAYMENTS.DELETE)
  if (!auth.ok) return auth.response

  const ok = await deletePayment(params.paymentId)
  if (!ok) return jsonError(404, "NOT_FOUND", "Payment not found")
  return jsonOk({ ok: true })
}

