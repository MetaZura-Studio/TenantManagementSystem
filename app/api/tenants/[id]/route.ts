import { requirePermission, PERMISSIONS } from "@/app/api/_platform/auth"
import { jsonError, jsonOk } from "@/app/api/_platform/http"
import { getMysqlPool } from "@/lib/server/mysql"
import type { Tenant } from "@/features/tenants/types"

function toId(raw: string) {
  const id = Number.parseInt(raw, 10)
  return Number.isFinite(id) ? id : null
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
    subscriptionStartDate: row.subscription_start_date ?? undefined,
    subscriptionEndDate: row.subscription_end_date ?? undefined,
    lockedAt: row.locked_at ?? undefined,
    suspensionReason: row.suspension_reason ?? undefined,
    deletedAt: row.deleted_at ?? undefined,
    createdAt: row.created_at,
    createdBy: row.created_by != null ? String(row.created_by) : undefined,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by != null ? String(row.updated_by) : undefined,
  }
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const auth = requirePermission(PERMISSIONS.TENANTS.VIEW)
  if (!auth.ok) return auth.response

  const id = toId(params.id)
  if (!id) return jsonError(400, "BAD_REQUEST", "Invalid id")

  try {
    const pool = getMysqlPool()
    const [rows] = await pool.query(
      `
      SELECT
        id,
        tenant_code,
        slug,
        shop_name_en,
        shop_name_ar,
        owner_name,
        owner_email,
        owner_mobile,
        tenant_type,
        contact_person,
        address,
        city,
        zip_code,
        country,
        subscription_status,
        subscription_start_date,
        subscription_end_date,
        locked_at,
        suspension_reason,
        created_at,
        created_by,
        updated_at,
        updated_by,
        deleted_at
      FROM tenants
      WHERE id = ? AND deleted_at IS NULL
      LIMIT 1
      `,
      [id]
    )

    const row = (rows as any[])[0]
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
    const pool = getMysqlPool()
    const now = new Date()

    const normalizeDateTime = (value: unknown) => {
      if (value == null) return null
      const s = String(value).trim()
      return s.length === 0 ? null : s
    }

    const updateParams = {
      id,
      tenant_code: updates.tenantCode ?? null,
      slug: updates.slug ?? null,
      shop_name_en: updates.shopNameEn ?? null,
      shop_name_ar: updates.shopNameAr ?? null,
      owner_name: updates.ownerName ?? null,
      owner_email: updates.ownerEmail ?? null,
      owner_mobile: updates.ownerMobile ?? null,
      tenant_type: updates.tenantType ?? null,
      contact_person: updates.contactPerson ?? null,
      address: updates.address ?? null,
      city: updates.city ?? null,
      zip_code: updates.zipCode ?? null,
      country: updates.country ?? null,
      subscription_status: updates.subscriptionStatus ?? null,
      subscription_start_date: normalizeDateTime(updates.subscriptionStartDate),
      subscription_end_date: normalizeDateTime(updates.subscriptionEndDate),
      locked_at: normalizeDateTime(updates.lockedAt),
      suspension_reason: updates.suspensionReason ?? null,
      updated_at: now,
      updated_by: null,
    }

    await pool.query(
      `
      UPDATE tenants
      SET
        tenant_code = COALESCE(:tenant_code, tenant_code),
        slug = COALESCE(:slug, slug),
        shop_name_en = COALESCE(:shop_name_en, shop_name_en),
        shop_name_ar = COALESCE(:shop_name_ar, shop_name_ar),
        owner_name = COALESCE(:owner_name, owner_name),
        owner_email = COALESCE(:owner_email, owner_email),
        owner_mobile = COALESCE(:owner_mobile, owner_mobile),
        tenant_type = COALESCE(:tenant_type, tenant_type),
        contact_person = COALESCE(:contact_person, contact_person),
        address = COALESCE(:address, address),
        city = COALESCE(:city, city),
        zip_code = COALESCE(:zip_code, zip_code),
        country = COALESCE(:country, country),
        subscription_status = COALESCE(:subscription_status, subscription_status),
        subscription_start_date = COALESCE(:subscription_start_date, subscription_start_date),
        subscription_end_date = COALESCE(:subscription_end_date, subscription_end_date),
        locked_at = COALESCE(:locked_at, locked_at),
        suspension_reason = COALESCE(:suspension_reason, suspension_reason),
        updated_at = :updated_at,
        updated_by = :updated_by
      WHERE id = :id AND deleted_at IS NULL
      `,
      updateParams as any
    )

    const [rows] = await pool.query(
      `
      SELECT
        id,
        tenant_code,
        slug,
        shop_name_en,
        shop_name_ar,
        owner_name,
        owner_email,
        owner_mobile,
        tenant_type,
        contact_person,
        address,
        city,
        zip_code,
        country,
        subscription_status,
        subscription_start_date,
        subscription_end_date,
        locked_at,
        suspension_reason,
        created_at,
        created_by,
        updated_at,
        updated_by,
        deleted_at
      FROM tenants
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    )
    const row = (rows as any[])[0]
    if (!row) return jsonError(404, "NOT_FOUND", "Tenant not found")
    return jsonOk(rowToTenant(row))
  } catch (err: any) {
    const message =
      err?.code === "ER_DUP_ENTRY"
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
    const pool = getMysqlPool()
    const [result] = await pool.query(
      `UPDATE tenants SET deleted_at = NOW(), updated_at = NOW() WHERE id = ? AND deleted_at IS NULL`,
      [id]
    )
    const affected = (result as any).affectedRows ?? 0
    if (affected === 0) return jsonError(404, "NOT_FOUND", "Tenant not found")
    return jsonOk({ ok: true })
  } catch (err: any) {
    return jsonError(400, "BAD_REQUEST", err?.message ?? "Failed to delete tenant")
  }
}

