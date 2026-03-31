import { requirePermission, PERMISSIONS } from "@/app/api/_platform/auth"
import { jsonError, jsonOk } from "@/app/api/_platform/http"
import { getMysqlPool } from "@/lib/server/mysql"
import type { TenantSubscription } from "@/features/tenant-subscriptions/types"

function toId(raw: string) {
  const id = Number.parseInt(raw, 10)
  return Number.isFinite(id) ? id : null
}

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
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    )

    const row = (rows as any[])[0]
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
    const pool = getMysqlPool()
    const now = new Date()

    const updateParams = {
      id,
      subscription_code: updates.subscriptionId ?? null,
      tenant_id: tenantId,
      plan_id: planId,
      status: updates.status ?? null,
      start_date: updates.startDate ?? null,
      end_date: updates.endDate ?? null,
      current_period_start: updates.currentPeriodStart ?? null,
      current_period_end: updates.currentPeriodEnd ?? null,
      auto_lock_date: updates.lockedAt ?? null,
      billing_currency_code: updates.billingCurrency ?? updates.billingCurrencyCode ?? null,
      unit_price: updates.unitPrice ?? null,
      auto_renew: typeof updates.autoRenew === "boolean" ? (updates.autoRenew ? 1 : 0) : null,
      cancel_at_period_end:
        typeof updates.cancelAtPeriodEnd === "boolean"
          ? updates.cancelAtPeriodEnd
            ? 1
            : 0
          : null,
      canceled_at: updates.canceledAt ?? null,
      override_notes: updates.overrideNotes ?? null,
      notes: updates.notes ?? null,
      updated_at: now,
      updated_by: null,
    }

    await pool.query(
      `
      UPDATE tenant_subscriptions
      SET
        subscription_code = COALESCE(:subscription_code, subscription_code),
        tenant_id = COALESCE(:tenant_id, tenant_id),
        plan_id = COALESCE(:plan_id, plan_id),
        status = COALESCE(:status, status),
        start_date = COALESCE(:start_date, start_date),
        end_date = COALESCE(:end_date, end_date),
        current_period_start = COALESCE(:current_period_start, current_period_start),
        current_period_end = COALESCE(:current_period_end, current_period_end),
        auto_lock_date = COALESCE(:auto_lock_date, auto_lock_date),
        billing_currency_code = COALESCE(:billing_currency_code, billing_currency_code),
        unit_price = COALESCE(:unit_price, unit_price),
        auto_renew = COALESCE(:auto_renew, auto_renew),
        cancel_at_period_end = COALESCE(:cancel_at_period_end, cancel_at_period_end),
        canceled_at = COALESCE(:canceled_at, canceled_at),
        override_notes = COALESCE(:override_notes, override_notes),
        notes = COALESCE(:notes, notes),
        updated_at = :updated_at,
        updated_by = :updated_by
      WHERE id = :id
      `,
      updateParams as any
    )

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
      [id]
    )

    const row = (rows as any[])[0]
    if (!row) return jsonError(404, "NOT_FOUND", "Subscription not found")
    return jsonOk(rowToSubscription(row))
  } catch (err: any) {
    const message =
      err?.code === "ER_DUP_ENTRY"
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
    const pool = getMysqlPool()
    const [result] = await pool.query(`DELETE FROM tenant_subscriptions WHERE id = ?`, [id])
    const affected = (result as any).affectedRows ?? 0
    if (affected === 0) return jsonError(404, "NOT_FOUND", "Subscription not found")
    return jsonOk({ ok: true })
  } catch (err: any) {
    return jsonError(400, "BAD_REQUEST", err?.message ?? "Failed to delete subscription")
  }
}

