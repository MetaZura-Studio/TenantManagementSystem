import { requirePermission, PERMISSIONS } from "@/app/api/_platform/auth"
import { jsonError, jsonOk } from "@/app/api/_platform/http"
import { prisma } from "@/lib/server/prisma"
import type { TenantSubscription } from "@/features/tenant-subscriptions/types"

export const runtime = "nodejs"

function toId(raw: string) {
  const id = Number.parseInt(raw, 10)
  return Number.isFinite(id) ? id : null
}

function toIso(value: any) {
  if (!value) return value
  return value instanceof Date ? value.toISOString() : value
}

function rowToSubscription(row: any): TenantSubscription {
  return {
    id: String(row.id),
    subscriptionId: row.subscription_code,
    tenantId: String(row.tenant_id),
    planId: String(row.plan_id),
    status: row.status,
    startDate: toIso(row.start_date),
    endDate: toIso(row.end_date),
    currentPeriodStart: toIso(row.current_period_start) ?? undefined,
    currentPeriodEnd: toIso(row.current_period_end) ?? undefined,
    lockedAt: toIso(row.auto_lock_date) ?? undefined,
    canceledAt: toIso(row.canceled_at) ?? undefined,

    billingCurrency: row.billing_currency_code,
    unitPrice: Number(row.unit_price ?? 0),
    discountAmount: 0,
    discountPercent: 0,
    autoRenew: Boolean(row.auto_renew),
    cancelAtPeriodEnd: Boolean(row.cancel_at_period_end),

    notes: row.notes ?? undefined,
    overrideNotes: row.override_notes ?? undefined,

    createdAt: row.created_at,
    createdBy: row.created_by != null ? String(row.created_by) : undefined,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by != null ? String(row.updated_by) : undefined,

    billingCurrencyCode: row.billing_currency_code,
    cancelledAt: row.canceled_at ?? undefined,
  }
}

function toIntId(raw: any) {
  const n = Number.parseInt(String(raw), 10)
  return Number.isFinite(n) ? n : null
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const auth = requirePermission(PERMISSIONS.SUBSCRIPTIONS.VIEW)
  if (!auth.ok) return auth.response

  const id = toId(params.id)
  if (!id) return jsonError(400, "BAD_REQUEST", "Invalid id")

  try {
    const row = await prisma.tenant_subscriptions.findUnique({ where: { id } })
    if (!row) return jsonError(404, "NOT_FOUND", "Subscription not found")
    return jsonOk(rowToSubscription(row))
  } catch (err: any) {
    return jsonError(400, "BAD_REQUEST", err?.message ?? "Failed to load subscription")
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = requirePermission(PERMISSIONS.SUBSCRIPTIONS.UPDATE)
  if (!auth.ok) return auth.response

  const id = toId(params.id)
  if (!id) return jsonError(400, "BAD_REQUEST", "Invalid id")

  let updates: Partial<TenantSubscription>
  try {
    updates = (await req.json()) as Partial<TenantSubscription>
  } catch {
    return jsonError(400, "BAD_REQUEST", "Invalid JSON body")
  }

  const tenantId = updates.tenantId != null ? toIntId(updates.tenantId) : null
  const planId = updates.planId != null ? toIntId(updates.planId) : null

  try {
    const now = new Date()

    const row = await prisma.tenant_subscriptions.update({
      where: { id },
      data: {
        subscription_code: updates.subscriptionId ?? undefined,
        tenant_id: tenantId ?? undefined,
        plan_id: planId ?? undefined,
        status: updates.status ?? undefined,
        start_date: updates.startDate ? (new Date(String(updates.startDate)) as any) : undefined,
        end_date: updates.endDate ? (new Date(String(updates.endDate)) as any) : undefined,
        current_period_start: updates.currentPeriodStart
          ? (new Date(String(updates.currentPeriodStart)) as any)
          : undefined,
        current_period_end: updates.currentPeriodEnd
          ? (new Date(String(updates.currentPeriodEnd)) as any)
          : undefined,
        auto_lock_date: updates.lockedAt ? (new Date(String(updates.lockedAt)) as any) : undefined,
        billing_currency_code:
          updates.billingCurrency ?? updates.billingCurrencyCode ?? undefined,
        unit_price: updates.unitPrice != null ? (Number(updates.unitPrice) as any) : undefined,
        auto_renew: typeof updates.autoRenew === "boolean" ? Boolean(updates.autoRenew) : undefined,
        cancel_at_period_end:
          typeof updates.cancelAtPeriodEnd === "boolean"
            ? Boolean(updates.cancelAtPeriodEnd)
            : undefined,
        canceled_at: updates.canceledAt ? (new Date(String(updates.canceledAt)) as any) : undefined,
        override_notes: updates.overrideNotes ?? undefined,
        notes: updates.notes ?? undefined,
        updated_at: now,
        updated_by: null,
      } as any,
    })
    if (!row) return jsonError(404, "NOT_FOUND", "Subscription not found")
    return jsonOk(rowToSubscription(row))
  } catch (err: any) {
    const message =
      err?.code === "P2002" || err?.code === "ER_DUP_ENTRY"
        ? "Duplicate subscription code"
        : err?.message ?? "Failed to update subscription"
    return jsonError(400, "BAD_REQUEST", message)
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const auth = requirePermission(PERMISSIONS.SUBSCRIPTIONS.DELETE)
  if (!auth.ok) return auth.response

  const id = toId(params.id)
  if (!id) return jsonError(400, "BAD_REQUEST", "Invalid id")

  try {
    const existing = await prisma.tenant_subscriptions.findUnique({ where: { id } })
    if (!existing) return jsonError(404, "NOT_FOUND", "Subscription not found")
    await prisma.tenant_subscriptions.delete({ where: { id } })
    return jsonOk({ ok: true })
  } catch (err: any) {
    return jsonError(400, "BAD_REQUEST", err?.message ?? "Failed to delete subscription")
  }
}

