import { requirePermission, PERMISSIONS } from "@/app/api/_platform/auth"
import { jsonError, jsonOk } from "@/app/api/_platform/http"
import { prisma } from "@/lib/server/prisma"
import type { Plan } from "@/features/plans/types"

export const runtime = "nodejs"

function toId(raw: string) {
  const id = Number.parseInt(raw, 10)
  return Number.isFinite(id) ? id : null
}

function toIso(value: any) {
  if (!value) return value
  return value instanceof Date ? value.toISOString() : value
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
    createdAt: toIso(row.created_at),
    createdBy: row.created_by != null ? String(row.created_by) : undefined,
    updatedAt: toIso(row.updated_at),
    updatedBy: row.updated_by != null ? String(row.updated_by) : undefined,
  }
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const auth = requirePermission(PERMISSIONS.PLANS.VIEW)
  if (!auth.ok) return auth.response

  const id = toId(params.id)
  if (!id) return jsonError(400, "BAD_REQUEST", "Invalid id")

  try {
    const row = await prisma.plans.findUnique({ where: { id } })
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
    const now = new Date()

    const row = await prisma.plans.update({
      where: { id },
      data: {
        plan_code: updates.planCode ?? undefined,
        name_en: updates.nameEn ?? undefined,
        name_ar: updates.nameAr ?? undefined,
        description: updates.description ?? undefined,
        billing_cycle: updates.billingCycle ?? undefined,
        currency_code: updates.currencyCode ?? undefined,
        price: updates.monthlyPrice != null ? (updates.monthlyPrice as any) : undefined,
        monthly_price: updates.monthlyPrice != null ? (updates.monthlyPrice as any) : undefined,
        yearly_price: updates.yearlyPrice != null ? (updates.yearlyPrice as any) : undefined,
        max_branches: updates.maxBranches ?? undefined,
        max_users: updates.maxUsers ?? undefined,
        features_json: updates.featuresJson ?? undefined,
        is_active: typeof updates.isActive === "boolean" ? Boolean(updates.isActive) : undefined,
        updated_at: now,
        updated_by: null,
      } as any,
    })
    if (!row) return jsonError(404, "NOT_FOUND", "Plan not found")
    return jsonOk(rowToPlan(row))
  } catch (err: any) {
    const message =
      err?.code === "P2002" || err?.code === "ER_DUP_ENTRY"
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
    const existing = await prisma.plans.findUnique({ where: { id } })
    if (!existing) return jsonError(404, "NOT_FOUND", "Plan not found")
    await prisma.plans.delete({ where: { id } })
    return jsonOk({ ok: true })
  } catch (err: any) {
    return jsonError(400, "BAD_REQUEST", err?.message ?? "Failed to delete plan")
  }
}

