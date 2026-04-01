import { requirePermission, PERMISSIONS } from "@/app/api/_platform/auth"
import { jsonError, jsonOk } from "@/app/api/_platform/http"
import { prisma } from "@/lib/server/prisma"
import type { Plan } from "@/features/plans/types"

export const runtime = "nodejs"

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

export async function GET() {
  const auth = requirePermission(PERMISSIONS.PLANS.VIEW)
  if (!auth.ok) return auth.response

  try {
    const rows = await prisma.plans.findMany({ orderBy: { id: "desc" } })
    return jsonOk(rows.map(rowToPlan))
  } catch (err: any) {
    return jsonError(400, "BAD_REQUEST", err?.message ?? "Failed to load plans")
  }
}

export async function POST(req: Request) {
  const auth = requirePermission(PERMISSIONS.PLANS.CREATE)
  if (!auth.ok) return auth.response

  let body: Omit<Plan, "id" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy">
  try {
    body = (await req.json()) as Omit<
      Plan,
      "id" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy"
    >
  } catch {
    return jsonError(400, "BAD_REQUEST", "Invalid JSON body")
  }

  if (
    !body?.planCode ||
    !body?.nameEn ||
    !body?.billingCycle ||
    !body?.currencyCode
  ) {
    return jsonError(400, "BAD_REQUEST", "Missing required plan fields")
  }

  try {
    const now = new Date()

    const created = await prisma.plans.create({
      data: {
        plan_code: body.planCode,
        name_en: body.nameEn,
        name_ar: body.nameAr ?? null,
        description: body.description ?? null,
        billing_cycle: body.billingCycle,
        currency_code: body.currencyCode,
        price: (body.monthlyPrice ?? 0) as any,
        monthly_price: (body.monthlyPrice ?? 0) as any,
        yearly_price: (body.yearlyPrice ?? 0) as any,
        max_branches: body.maxBranches ?? null,
        max_users: body.maxUsers ?? null,
        features_json: body.featuresJson ?? null,
        is_active: Boolean(body.isActive),
        created_at: now,
        created_by: null,
        updated_at: now,
        updated_by: null,
      } as any,
    })

    return jsonOk(rowToPlan(created), { status: 201 })
  } catch (err: any) {
    const message =
      err?.code === "P2002" || err?.code === "ER_DUP_ENTRY"
        ? "Duplicate plan code"
        : err?.message ?? "Failed to create plan"
    return jsonError(400, "BAD_REQUEST", message)
  }
}

