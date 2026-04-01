import { requirePermission, PERMISSIONS } from "@/app/api/_platform/auth"
import { jsonError, jsonOk } from "@/app/api/_platform/http"
import { getMysqlPool } from "@/lib/server/mysql"
import type { Tenant } from "@/features/tenants/types"

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

export async function GET() {
  const auth = requirePermission(PERMISSIONS.TENANTS.VIEW)
  if (!auth.ok) return auth.response

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
      WHERE deleted_at IS NULL
      ORDER BY id DESC
      `
    )

    return jsonOk((rows as any[]).map(rowToTenant))
  } catch (err: any) {
    return jsonError(400, "BAD_REQUEST", err?.message ?? "Failed to load tenants")
  }
}

export async function POST(req: Request) {
  const auth = requirePermission(PERMISSIONS.TENANTS.CREATE)
  if (!auth.ok) return auth.response

  let body: Partial<Tenant>
  try {
    body = (await req.json()) as Partial<Tenant>
  } catch {
    return jsonError(400, "BAD_REQUEST", "Invalid JSON body")
  }

  if (!body?.tenantCode || !body?.slug || !body?.shopNameEn || !body?.ownerName || !body?.ownerEmail) {
    return jsonError(400, "BAD_REQUEST", "Missing required tenant fields")
  }

  try {
    const pool = getMysqlPool()
    const now = new Date()

    const params = {
      tenant_code: body.tenantCode,
      slug: body.slug,
      shop_name_en: body.shopNameEn,
      shop_name_ar: body.shopNameAr ?? null,
      owner_name: body.ownerName,
      owner_email: body.ownerEmail,
      owner_mobile: body.ownerMobile ?? "",
      tenant_type: body.tenantType ?? "Individual",
      contact_person: body.contactPerson ?? null,
      address: body.address ?? null,
      city: body.city ?? null,
      zip_code: body.zipCode ?? null,
      country: body.country ?? null,
      status: "Active",
      subscription_status: body.subscriptionStatus ?? "TRIAL",
      subscription_start_date: body.subscriptionStartDate ?? null,
      subscription_end_date: body.subscriptionEndDate ?? null,
      locked_at: body.lockedAt ?? null,
      suspension_reason: body.suspensionReason ?? null,
      created_at: now,
      created_by: null,
      updated_at: now,
      updated_by: null,
    }

    const [result] = await pool.query(
      `
      INSERT INTO tenants (
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
        status,
        subscription_status,
        subscription_start_date,
        subscription_end_date,
        locked_at,
        suspension_reason,
        created_at,
        created_by,
        updated_at,
        updated_by
      ) VALUES (
        :tenant_code,
        :slug,
        :shop_name_en,
        :shop_name_ar,
        :owner_name,
        :owner_email,
        :owner_mobile,
        :tenant_type,
        :contact_person,
        :address,
        :city,
        :zip_code,
        :country,
        :status,
        :subscription_status,
        :subscription_start_date,
        :subscription_end_date,
        :locked_at,
        :suspension_reason,
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
      [insertedId]
    )

    const row = (rows as any[])[0]
    return jsonOk(rowToTenant(row), { status: 201 })
  } catch (err: any) {
    const message =
      err?.code === "ER_DUP_ENTRY"
        ? "Duplicate tenant code/slug/email"
        : err?.message ?? "Failed to create tenant"
    return jsonError(400, "BAD_REQUEST", message)
  }
}

