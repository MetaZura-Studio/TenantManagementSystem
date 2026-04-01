import { requirePermission, PERMISSIONS } from "@/app/api/_platform/auth"
import { jsonError, jsonOk } from "@/app/api/_platform/http"
import { getMysqlPool } from "@/lib/server/mysql"
import type { Branch } from "@/features/branches/types"

function rowToBranch(row: any): Branch {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    branchCode: row.branch_code,
    nameEn: row.name_en,
    nameAr: row.name_ar ?? "",
    address: row.address ?? "",
    city: row.city ?? "",
    state: row.state ?? "",
    zipCode: row.zip_code ?? "",
    country: row.country ?? "",
    phone: row.phone ?? "",
    contactName: row.contact_name ?? "",
    status: row.status,
    remarks: row.remarks ?? undefined,
    createdAt: row.created_at,
    createdBy: row.created_by != null ? String(row.created_by) : undefined,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by != null ? String(row.updated_by) : undefined,
  }
}

export async function GET() {
  const auth = requirePermission(PERMISSIONS.BRANCHES.VIEW)
  if (!auth.ok) return auth.response

  try {
    const pool = getMysqlPool()
    const [rows] = await pool.query(
      `
      SELECT
        id,
        tenant_id,
        branch_code,
        name_en,
        name_ar,
        address,
        city,
        state,
        zip_code,
        country,
        phone,
        contact_name,
        remarks,
        status,
        created_at,
        created_by,
        updated_at,
        updated_by
      FROM branches
      ORDER BY id DESC
      `
    )
    return jsonOk((rows as any[]).map(rowToBranch))
  } catch (err: any) {
    return jsonError(400, "BAD_REQUEST", err?.message ?? "Failed to load branches")
  }
}

export async function POST(req: Request) {
  const auth = requirePermission(PERMISSIONS.BRANCHES.CREATE)
  if (!auth.ok) return auth.response

  let body: Partial<Branch>
  try {
    body = (await req.json()) as Partial<Branch>
  } catch {
    return jsonError(400, "BAD_REQUEST", "Invalid JSON body")
  }

  const tenantId = Number.parseInt(String(body.tenantId ?? ""), 10)
  if (!Number.isFinite(tenantId)) return jsonError(400, "BAD_REQUEST", "Invalid tenantId")

  if (!body?.branchCode || !body?.nameEn) {
    return jsonError(400, "BAD_REQUEST", "Missing required branch fields")
  }

  try {
    const pool = getMysqlPool()
    const now = new Date()

    const params = {
      tenant_id: tenantId,
      branch_code: body.branchCode,
      name_en: body.nameEn,
      name_ar: body.nameAr ?? null,
      address: body.address ?? null,
      city: body.city ?? null,
      state: body.state ?? null,
      zip_code: body.zipCode ?? null,
      country: body.country ?? null,
      phone: body.phone ?? null,
      email: null,
      contact_name: body.contactName ?? null,
      remarks: body.remarks ?? null,
      status: body.status ?? "ACTIVE",
      created_at: now,
      created_by: null,
      updated_at: now,
      updated_by: null,
    }

    const [result] = await pool.query(
      `
      INSERT INTO branches (
        tenant_id,
        branch_code,
        name_en,
        name_ar,
        address,
        city,
        state,
        zip_code,
        country,
        phone,
        email,
        contact_name,
        remarks,
        status,
        created_at,
        created_by,
        updated_at,
        updated_by
      ) VALUES (
        :tenant_id,
        :branch_code,
        :name_en,
        :name_ar,
        :address,
        :city,
        :state,
        :zip_code,
        :country,
        :phone,
        :email,
        :contact_name,
        :remarks,
        :status,
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
        tenant_id,
        branch_code,
        name_en,
        name_ar,
        address,
        city,
        state,
        zip_code,
        country,
        phone,
        contact_name,
        remarks,
        status,
        created_at,
        created_by,
        updated_at,
        updated_by
      FROM branches
      WHERE id = ?
      LIMIT 1
      `,
      [insertedId]
    )

    const row = (rows as any[])[0]
    return jsonOk(rowToBranch(row), { status: 201 })
  } catch (err: any) {
    return jsonError(400, "BAD_REQUEST", err?.message ?? "Failed to create branch")
  }
}

