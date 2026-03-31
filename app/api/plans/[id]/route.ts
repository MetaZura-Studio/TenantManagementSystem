import { requirePermission, PERMISSIONS } from "@/app/api/_platform/auth"
import { jsonError, jsonOk } from "@/app/api/_platform/http"
import { getMysqlPool } from "@/lib/server/mysql"
import type { Plan } from "@/features/plans/types"

function toId(raw: string) {
  const id = Number.parseInt(raw, 10)
  return Number.isFinite(id) ? id : null
}

function rowToPlan(row: any): Plan {
  return {
    id: String(row.id),
    planCode: row.plan_code,
    nameEn: row.name_en,
    nameAr: row.name_ar ?? "",
    description: row.description ?? undefined,
    billingCycle: row.billing_cycle,
    currencyCode: row.currency_code,
    monthlyPrice: Number(row.monthly_price ?? row.price ?? 0),
    yearlyPrice: Number(row.yearly_price ?? 0),
    maxBranches: Number(row.max_branches ?? 0),
    maxUsers: Number(row.max_users ?? 0),
    isActive: Boolean(row.is_active),
    featuresJson: row.features_json ?? undefined,
    createdAt: row.created_at,
    createdBy: row.created_by != null ? String(row.created_by) : undefined,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by != null ? String(row.updated_by) : undefined,
  }
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const auth = requirePermission(PERMISSIONS.PLANS.VIEW)
  if (!auth.ok) return auth.response

  const id = toId(params.id)
  if (!id) return jsonError(400, "BAD_REQUEST", "Invalid id")

  try {
    const pool = getMysqlPool()
    const [rows] = await pool.query(
      `
      SELECT
        id,
        plan_code,
        name_en,
        name_ar,
        description,
        billing_cycle,
        currency_code,
        price,
        monthly_price,
        yearly_price,
        max_branches,
        max_users,
        features_json,
        is_active,
        created_at,
        created_by,
        updated_at,
        updated_by
      FROM plans
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    )

    const row = (rows as any[])[0]
    if (!row) return jsonError(404, "NOT_FOUND", "Plan not found")
    return jsonOk(rowToPlan(row))
  } catch (err: any) {
    return jsonError(400, "BAD_REQUEST", err?.message ?? "Failed to load plan")
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = requirePermission(PERMISSIONS.PLANS.UPDATE)
  if (!auth.ok) return auth.response

  const id = toId(params.id)
  if (!id) return jsonError(400, "BAD_REQUEST", "Invalid id")

  let updates: Partial<Plan>
  try {
    updates = (await req.json()) as Partial<Plan>
  } catch {
    return jsonError(400, "BAD_REQUEST", "Invalid JSON body")
  }

  try {
    const pool = getMysqlPool()
    const now = new Date()

    const updateParams = {
      id,
      plan_code: updates.planCode ?? null,
      name_en: updates.nameEn ?? null,
      name_ar: updates.nameAr ?? null,
      description: updates.description ?? null,
      billing_cycle: updates.billingCycle ?? null,
      currency_code: updates.currencyCode ?? null,
      price: updates.monthlyPrice ?? null,
      monthly_price: updates.monthlyPrice ?? null,
      yearly_price: updates.yearlyPrice ?? null,
      max_branches: updates.maxBranches ?? null,
      max_users: updates.maxUsers ?? null,
      features_json: updates.featuresJson ?? null,
      is_active: typeof updates.isActive === "boolean" ? (updates.isActive ? 1 : 0) : null,
      updated_at: now,
      updated_by: null,
    }

    await pool.query(
      `
      UPDATE plans
      SET
        plan_code = COALESCE(:plan_code, plan_code),
        name_en = COALESCE(:name_en, name_en),
        name_ar = COALESCE(:name_ar, name_ar),
        description = COALESCE(:description, description),
        billing_cycle = COALESCE(:billing_cycle, billing_cycle),
        currency_code = COALESCE(:currency_code, currency_code),
        price = COALESCE(:price, price),
        monthly_price = COALESCE(:monthly_price, monthly_price),
        yearly_price = COALESCE(:yearly_price, yearly_price),
        max_branches = COALESCE(:max_branches, max_branches),
        max_users = COALESCE(:max_users, max_users),
        features_json = COALESCE(:features_json, features_json),
        is_active = COALESCE(:is_active, is_active),
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
        plan_code,
        name_en,
        name_ar,
        description,
        billing_cycle,
        currency_code,
        price,
        monthly_price,
        yearly_price,
        max_branches,
        max_users,
        features_json,
        is_active,
        created_at,
        created_by,
        updated_at,
        updated_by
      FROM plans
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    )

    const row = (rows as any[])[0]
    if (!row) return jsonError(404, "NOT_FOUND", "Plan not found")
    return jsonOk(rowToPlan(row))
  } catch (err: any) {
    const message =
      err?.code === "ER_DUP_ENTRY"
        ? "Duplicate plan code"
        : err?.message ?? "Failed to update plan"
    return jsonError(400, "BAD_REQUEST", message)
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const auth = requirePermission(PERMISSIONS.PLANS.DELETE)
  if (!auth.ok) return auth.response

  const id = toId(params.id)
  if (!id) return jsonError(400, "BAD_REQUEST", "Invalid id")

  try {
    const pool = getMysqlPool()
    const [result] = await pool.query(`DELETE FROM plans WHERE id = ?`, [id])
    const affected = (result as any).affectedRows ?? 0
    if (affected === 0) return jsonError(404, "NOT_FOUND", "Plan not found")
    return jsonOk({ ok: true })
  } catch (err: any) {
    return jsonError(400, "BAD_REQUEST", err?.message ?? "Failed to delete plan")
  }
}

