import { requirePermission, PERMISSIONS } from "@/app/api/_platform/auth"
import { jsonError, jsonOk } from "@/app/api/_platform/http"
import { prisma } from "@/lib/server/prisma"
import type { Tenant } from "@/features/tenants/types"

export const runtime = "nodejs"

function toId(raw: string) {
  const id = Number.parseInt(raw, 10)
  return Number.isFinite(id) ? id : null
}

function toIso(value: any) {
  if (!value) return value
  return value instanceof Date ? value.toISOString() : value
}

function rowToTenant(row: any): Tenant {
  return {
    id: String(row.id),
    tenantCode: row.tenant_code,
    slug: row.slug,
    shopNameEn: row.shop_name_en,
    shopNameAr: row.shop_name_ar ?? "",
    ownerName: row.owner_name,
    ownerEmail: row.owner_email,
    ownerMobile: row.owner_mobile,
    tenantType: row.tenant_type,
    contactPerson: row.contact_person ?? "",
    address: row.address ?? "",
    city: row.city ?? "",
    zipCode: row.zip_code ?? "",
    country: row.country ?? "",
    timezone: "UTC",
    subscriptionStatus: row.subscription_status,
    subscriptionStartDate: toIso(row.subscription_start_date) ?? undefined,
    subscriptionEndDate: toIso(row.subscription_end_date) ?? undefined,
    lockedAt: toIso(row.locked_at) ?? undefined,
    suspensionReason: row.suspension_reason ?? undefined,
    deletedAt: toIso(row.deleted_at) ?? undefined,
    createdAt: toIso(row.created_at),
    createdBy: row.created_by != null ? String(row.created_by) : undefined,
    updatedAt: toIso(row.updated_at),
    updatedBy: row.updated_by != null ? String(row.updated_by) : undefined,
  }
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const auth = requirePermission(PERMISSIONS.TENANTS.VIEW)
  if (!auth.ok) return auth.response

  const id = toId(params.id)
  if (!id) return jsonError(400, "BAD_REQUEST", "Invalid id")

  try {
    const row = await prisma.tenants.findFirst({
      where: { id, deleted_at: null },
    })
    if (!row) return jsonError(404, "NOT_FOUND", "Tenant not found")
    return jsonOk(rowToTenant(row))
  } catch (err: any) {
    return jsonError(400, "BAD_REQUEST", err?.message ?? "Failed to load tenant")
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const auth = requirePermission(PERMISSIONS.TENANTS.UPDATE)
  if (!auth.ok) return auth.response

  const id = toId(params.id)
  if (!id) return jsonError(400, "BAD_REQUEST", "Invalid id")

  let updates: Partial<Tenant>
  try {
    updates = (await req.json()) as Partial<Tenant>
  } catch {
    return jsonError(400, "BAD_REQUEST", "Invalid JSON body")
  }

  try {
    const now = new Date()

    const normalizeDateTime = (value: unknown) => {
      if (value == null) return null
      const s = String(value).trim()
      return s.length === 0 ? null : s
    }

    const row = await prisma.tenants.update({
      where: { id },
      data: {
        tenant_code: updates.tenantCode ?? undefined,
        slug: updates.slug ?? undefined,
        shop_name_en: updates.shopNameEn ?? undefined,
        shop_name_ar: updates.shopNameAr ?? undefined,
        owner_name: updates.ownerName ?? undefined,
        owner_email: updates.ownerEmail ?? undefined,
        owner_mobile: updates.ownerMobile ?? undefined,
        tenant_type: updates.tenantType ?? undefined,
        contact_person: updates.contactPerson ?? undefined,
        address: updates.address ?? undefined,
        city: updates.city ?? undefined,
        zip_code: updates.zipCode ?? undefined,
        country: updates.country ?? undefined,
        subscription_status: updates.subscriptionStatus ?? undefined,
        subscription_start_date: normalizeDateTime(updates.subscriptionStartDate) as any,
        subscription_end_date: normalizeDateTime(updates.subscriptionEndDate) as any,
        locked_at: normalizeDateTime(updates.lockedAt) as any,
        suspension_reason: updates.suspensionReason ?? undefined,
        updated_at: now,
        updated_by: null,
      } as any,
    })
    if (!row) return jsonError(404, "NOT_FOUND", "Tenant not found")
    return jsonOk(rowToTenant(row))
  } catch (err: any) {
    const message =
      err?.code === "P2002" || err?.code === "ER_DUP_ENTRY"
        ? "Duplicate tenant code/slug/email"
        : err?.message ?? "Failed to update tenant"
    return jsonError(400, "BAD_REQUEST", message)
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const auth = requirePermission(PERMISSIONS.TENANTS.DELETE)
  if (!auth.ok) return auth.response

  const id = toId(params.id)
  if (!id) return jsonError(400, "BAD_REQUEST", "Invalid id")

  try {
    const existing = await prisma.tenants.findFirst({ where: { id, deleted_at: null } })
    if (!existing) return jsonError(404, "NOT_FOUND", "Tenant not found")
    await prisma.tenants.update({
      where: { id },
      data: { deleted_at: new Date(), updated_at: new Date() } as any,
    })
    return jsonOk({ ok: true })
  } catch (err: any) {
    return jsonError(400, "BAD_REQUEST", err?.message ?? "Failed to delete tenant")
  }
}

