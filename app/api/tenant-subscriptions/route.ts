import { requirePermission, PERMISSIONS } from "@/app/api/_platform/auth"
import { jsonError, jsonOk } from "@/app/api/_platform/http"
import { getMysqlPool } from "@/lib/server/mysql"
import type { TenantSubscription } from "@/features/tenant-subscriptions/types"

function rowToSubscription(row: any): TenantSubscription {
  return {
    id: String(row.id),
    subscriptionId: row.subscription_code,
    tenantId: String(row.tenant_id),
    planId: String(row.plan_id),
    status: row.status,
    startDate: row.start_date,
    endDate: row.end_date,
    currentPeriodStart: row.current_period_start ?? undefined,
    currentPeriodEnd: row.current_period_end ?? undefined,
    lockedAt: row.auto_lock_date ?? undefined,
    canceledAt: row.canceled_at ?? undefined,

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
    const pool = getMysqlPool()
    const [rows] = await pool.query(
      `
      SELECT
        id,
        subscription_code,
        tenant_id,
        plan_id,
        status,
        start_date,
        end_date,
        current_period_start,
        current_period_end,
        auto_lock_date,
        billing_currency_code,
        unit_price,
        auto_renew,
        cancel_at_period_end,
        canceled_at,
        override_notes,
        notes,
        created_at,
        created_by,
        updated_at,
        updated_by
      FROM tenant_subscriptions
      ORDER BY id DESC
      `
    )

    return jsonOk((rows as any[]).map(rowToSubscription))
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
    const pool = getMysqlPool()
    const now = new Date()

    const params = {
      subscription_code: subscriptionCode,
      tenant_id: tenantId,
      plan_id: planId,
      status,
      start_date: startDate,
      end_date: endDate,
      current_period_start: body.currentPeriodStart ?? null,
      current_period_end: body.currentPeriodEnd ?? null,
      auto_lock_date: body.lockedAt ?? null,
      billing_currency_code: billingCurrency,
      unit_price: unitPrice,
      auto_renew: autoRenew ? 1 : 0,
      cancel_at_period_end: cancelAtPeriodEnd ? 1 : 0,
      canceled_at: body.canceledAt ?? null,
      overridden_by_admin: 0,
      override_notes: body.overrideNotes ?? null,
      notes: body.notes ?? null,
      created_at: now,
      created_by: null,
      updated_at: now,
      updated_by: null,
    }

    const [result] = await pool.query(
      `
      INSERT INTO tenant_subscriptions (
        subscription_code,
        tenant_id,
        plan_id,
        status,
        start_date,
        end_date,
        current_period_start,
        current_period_end,
        auto_lock_date,
        billing_currency_code,
        unit_price,
        auto_renew,
        cancel_at_period_end,
        canceled_at,
        overridden_by_admin,
        override_notes,
        notes,
        created_at,
        created_by,
        updated_at,
        updated_by
      ) VALUES (
        :subscription_code,
        :tenant_id,
        :plan_id,
        :status,
        :start_date,
        :end_date,
        :current_period_start,
        :current_period_end,
        :auto_lock_date,
        :billing_currency_code,
        :unit_price,
        :auto_renew,
        :cancel_at_period_end,
        :canceled_at,
        :overridden_by_admin,
        :override_notes,
        :notes,
        :created_at,
        :created_by,
        :updated_at,
        :updated_by
      )
      `,
      params as any
    )

    const insertedId = (result as any).insertId
    const [rows] = await pool.query(
      `
      SELECT
        id,
        subscription_code,
        tenant_id,
        plan_id,
        status,
        start_date,
        end_date,
        current_period_start,
        current_period_end,
        auto_lock_date,
        billing_currency_code,
        unit_price,
        auto_renew,
        cancel_at_period_end,
        canceled_at,
        override_notes,
        notes,
        created_at,
        created_by,
        updated_at,
        updated_by
      FROM tenant_subscriptions
      WHERE id = ?
      LIMIT 1
      `,
      [insertedId]
    )

    const row = (rows as any[])[0]
    return jsonOk(rowToSubscription(row), { status: 201 })
  } catch (err: any) {
    const message =
      err?.code === "ER_DUP_ENTRY"
        ? "Duplicate subscription code"
        : err?.message ?? "Failed to create subscription"
    return jsonError(400, "BAD_REQUEST", message)
  }
}

