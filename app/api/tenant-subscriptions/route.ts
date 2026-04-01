import { requirePermission, PERMISSIONS } from "@/app/api/_platform/auth"
import { jsonError, jsonOk } from "@/app/api/_platform/http"
import { prisma } from "@/lib/server/prisma"
import type { TenantSubscription } from "@/features/tenant-subscriptions/types"

export const runtime = "nodejs"

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

    // Optional legacy fields
    billingCurrencyCode: row.billing_currency_code,
    cancelledAt: row.canceled_at ?? undefined,
  }
}

function toIntId(raw: any) {
  const n = Number.parseInt(String(raw), 10)
  return Number.isFinite(n) ? n : null
}

function generateSubscriptionCode() {
  return `SUB-${Date.now()}`
}

export async function GET() {
  const auth = requirePermission(PERMISSIONS.SUBSCRIPTIONS.VIEW)
  if (!auth.ok) return auth.response

  try {
    const rows = await prisma.tenant_subscriptions.findMany({
      orderBy: { id: "desc" },
    })
    return jsonOk(rows.map(rowToSubscription))
  } catch (err: any) {
    return jsonError(400, "BAD_REQUEST", err?.message ?? "Failed to load subscriptions")
  }
}

export async function POST(req: Request) {
  const auth = requirePermission(PERMISSIONS.SUBSCRIPTIONS.CREATE)
  if (!auth.ok) return auth.response

  let body: Partial<TenantSubscription>
  try {
    body = (await req.json()) as Partial<TenantSubscription>
  } catch {
    return jsonError(400, "BAD_REQUEST", "Invalid JSON body")
  }

  const tenantId = toIntId(body.tenantId)
  const planId = toIntId(body.planId)
  const subscriptionCode = String(body.subscriptionId || "").trim() || generateSubscriptionCode()
  const status = String(body.status || "").trim()
  const startDate = String(body.startDate || "").trim()
  const endDate =
    String(body.endDate || "").trim() ||
    String(body.currentPeriodEnd || "").trim()

  const billingCurrency = String(body.billingCurrency || body.billingCurrencyCode || "").trim()
  const unitPrice = Number(body.unitPrice ?? 0)
  const autoRenew = Boolean(body.autoRenew)
  const cancelAtPeriodEnd = Boolean(body.cancelAtPeriodEnd)

  if (!tenantId || !planId || !status || !startDate || !endDate || !billingCurrency) {
    return jsonError(400, "BAD_REQUEST", "Missing required subscription fields")
  }

  try {
    const now = new Date()
    const created = await prisma.tenant_subscriptions.create({
      data: {
        subscription_code: subscriptionCode,
        tenant_id: tenantId,
        plan_id: planId,
        status,
        start_date: new Date(startDate) as any,
        end_date: new Date(endDate) as any,
        current_period_start: body.currentPeriodStart ? (new Date(String(body.currentPeriodStart)) as any) : null,
        current_period_end: body.currentPeriodEnd ? (new Date(String(body.currentPeriodEnd)) as any) : null,
        auto_lock_date: body.lockedAt ? (new Date(String(body.lockedAt)) as any) : null,
        billing_currency_code: billingCurrency,
        unit_price: unitPrice as any,
        auto_renew: Boolean(autoRenew),
        cancel_at_period_end: Boolean(cancelAtPeriodEnd),
        canceled_at: body.canceledAt ? (new Date(String(body.canceledAt)) as any) : null,
        overridden_by_admin: false,
        override_notes: body.overrideNotes ?? null,
        notes: body.notes ?? null,
        created_at: now,
        created_by: null,
        updated_at: now,
        updated_by: null,
      } as any,
    })
    return jsonOk(rowToSubscription(created), { status: 201 })
  } catch (err: any) {
    const message =
      err?.code === "P2002" || err?.code === "ER_DUP_ENTRY"
        ? "Duplicate subscription code"
        : err?.message ?? "Failed to create subscription"
    return jsonError(400, "BAD_REQUEST", message)
  }
}

