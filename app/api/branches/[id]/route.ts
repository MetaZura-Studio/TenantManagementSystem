import { requirePermission, PERMISSIONS } from "@/app/api/_platform/auth"
import { jsonError, jsonOk } from "@/app/api/_platform/http"
import { getMysqlPool } from "@/lib/server/mysql"
import type { Branch } from "@/features/branches/types"

function toId(raw: string) {
  const id = Number.parseInt(raw, 10)
  return Number.isFinite(id) ? id : null
}

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

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const auth = requirePermission(PERMISSIONS.BRANCHES.VIEW)
  if (!auth.ok) return auth.response

  const id = toId(params.id)
  if (!id) return jsonError(400, "BAD_REQUEST", "Invalid id")

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
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    )
    const row = (rows as any[])[0]
    if (!row) return jsonError(404, "NOT_FOUND", "Branch not found")
    return jsonOk(rowToBranch(row))
  } catch (err: any) {
    return jsonError(400, "BAD_REQUEST", err?.message ?? "Failed to load branch")
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const auth = requirePermission(PERMISSIONS.BRANCHES.UPDATE)
  if (!auth.ok) return auth.response

  const id = toId(params.id)
  if (!id) return jsonError(400, "BAD_REQUEST", "Invalid id")

  let updates: Partial<Branch>
  try {
    updates = (await req.json()) as Partial<Branch>
  } catch {
    return jsonError(400, "BAD_REQUEST", "Invalid JSON body")
  }

  const tenantId =
    updates.tenantId != null ? Number.parseInt(String(updates.tenantId), 10) : null
  if (updates.tenantId != null && !Number.isFinite(tenantId as any)) {
    return jsonError(400, "BAD_REQUEST", "Invalid tenantId")
  }

  try {
    const pool = getMysqlPool()
    const now = new Date()

    const updateParams = {
      id,
      tenant_id: tenantId,
      branch_code: updates.branchCode ?? null,
      name_en: updates.nameEn ?? null,
      name_ar: updates.nameAr ?? null,
      address: updates.address ?? null,
      city: updates.city ?? null,
      state: updates.state ?? null,
      zip_code: updates.zipCode ?? null,
      country: updates.country ?? null,
      phone: updates.phone ?? null,
      contact_name: updates.contactName ?? null,
      remarks: updates.remarks ?? null,
      status: updates.status ?? null,
      updated_at: now,
      updated_by: null,
    }

    await pool.query(
      `
      UPDATE branches
      SET
        tenant_id = COALESCE(:tenant_id, tenant_id),
        branch_code = COALESCE(:branch_code, branch_code),
        name_en = COALESCE(:name_en, name_en),
        name_ar = COALESCE(:name_ar, name_ar),
        address = COALESCE(:address, address),
        city = COALESCE(:city, city),
        state = COALESCE(:state, state),
        zip_code = COALESCE(:zip_code, zip_code),
        country = COALESCE(:country, country),
        phone = COALESCE(:phone, phone),
        contact_name = COALESCE(:contact_name, contact_name),
        remarks = COALESCE(:remarks, remarks),
        status = COALESCE(:status, status),
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
      [id]
    )

    const row = (rows as any[])[0]
    if (!row) return jsonError(404, "NOT_FOUND", "Branch not found")
    return jsonOk(rowToBranch(row))
  } catch (err: any) {
    return jsonError(400, "BAD_REQUEST", err?.message ?? "Failed to update branch")
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const auth = requirePermission(PERMISSIONS.BRANCHES.DELETE)
  if (!auth.ok) return auth.response

  const id = toId(params.id)
  if (!id) return jsonError(400, "BAD_REQUEST", "Invalid id")

  try {
    const pool = getMysqlPool()
    const [result] = await pool.query(`DELETE FROM branches WHERE id = ?`, [id])
    const affected = (result as any).affectedRows ?? 0
    if (affected === 0) return jsonError(404, "NOT_FOUND", "Branch not found")
    return jsonOk({ ok: true })
  } catch (err: any) {
    return jsonError(400, "BAD_REQUEST", err?.message ?? "Failed to delete branch")
  }
}

