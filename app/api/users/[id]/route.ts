import { requirePermission, PERMISSIONS } from "@/app/api/_platform/auth"
import { jsonError, jsonOk } from "@/app/api/_platform/http"
import { getMysqlPool } from "@/lib/server/mysql"
import type { User } from "@/features/users/types"

function toInt(raw: any) {
  const n = Number.parseInt(String(raw), 10)
  return Number.isFinite(n) ? n : null
}

async function getOrCreateMainBranchId(args: { tenantId: number }) {
  const pool = getMysqlPool()
  const [rows] = await pool.query(
    `SELECT id FROM branches WHERE tenant_id = ? ORDER BY id ASC LIMIT 1`,
    [args.tenantId]
  )
  const existing = (rows as any[])[0]
  if (existing?.id) return Number(existing.id)

  const now = new Date()
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
      ?, 'MAIN', 'Main Branch', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
      'ACTIVE', ?, NULL, ?, NULL
    )
    `,
    [args.tenantId, now, now]
  )
  return Number((result as any).insertId)
}

function rowToUser(row: any): User {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    branchId: row.branch_id != null ? String(row.branch_id) : undefined,
    roleId: String(row.role_id),
    fullNameEn: row.full_name_en,
    fullNameAr: row.full_name_ar,
    username: row.username,
    email: row.email,
    mobile: row.mobile ?? "",
    status: row.status,
    address: row.address ?? undefined,
    zipCode: row.zip_code ?? undefined,
    country: row.country ?? undefined,
    lastLoginAt: row.last_login_at ?? undefined,
    createdAt: row.created_at,
    createdBy: row.created_by != null ? String(row.created_by) : undefined,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by != null ? String(row.updated_by) : undefined,
  }
}

async function hashPassword(password: string) {
  const { randomBytes, scrypt } = await import("crypto")
  const salt = randomBytes(16)
  const keyLen = 64
  const N = 16384
  const r = 8
  const p = 1

  const derived: Buffer = await new Promise((resolve, reject) => {
    scrypt(password, salt, keyLen, { N, r, p }, (err, buf) => {
      if (err) reject(err)
      else resolve(buf as Buffer)
    })
  })

  return `scrypt$N=${N},r=${r},p=${p}$${salt.toString("base64")}$${derived.toString("base64")}`
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const auth = requirePermission(PERMISSIONS.USERS.VIEW)
  if (!auth.ok) return auth.response

  const id = toInt(params.id)
  if (!id) return jsonError(400, "BAD_REQUEST", "Invalid id")

  try {
    const pool = getMysqlPool()
    const [rows] = await pool.query(
      `
      SELECT
        id,
        tenant_id,
        branch_id,
        role_id,
        full_name_en,
        full_name_ar,
        username,
        email,
        mobile,
        status,
        address,
        zip_code,
        country,
        last_login_at,
        created_at,
        created_by,
        updated_at,
        updated_by
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    )
    const row = (rows as any[])[0]
    if (!row) return jsonError(404, "NOT_FOUND", "User not found")
    return jsonOk(rowToUser(row))
  } catch (err: any) {
    return jsonError(400, "BAD_REQUEST", err?.message ?? "Failed to load user")
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = requirePermission(PERMISSIONS.USERS.UPDATE)
  if (!auth.ok) return auth.response

  const id = toInt(params.id)
  if (!id) return jsonError(400, "BAD_REQUEST", "Invalid id")

  let updates: any
  try {
    updates = await req.json()
  } catch {
    return jsonError(400, "BAD_REQUEST", "Invalid JSON body")
  }

  const pool = getMysqlPool()
  const now = new Date()

  const tenantId = updates.tenantId != null ? toInt(updates.tenantId) : null
  const roleId = updates.roleId != null ? toInt(updates.roleId) : null
  const branchIdRaw = updates.branchId
  const branchId =
    branchIdRaw != null && String(branchIdRaw).trim() !== "" ? toInt(branchIdRaw) : null

  let passwordHash: string | null = null
  const password = typeof updates.password === "string" ? updates.password.trim() : ""
  if (password) {
    if (password.length < 6) {
      return jsonError(400, "BAD_REQUEST", "Password must be at least 6 characters")
    }
    passwordHash = await hashPassword(password)
  }

  // If branch is cleared but tenantId is known, resolve main branch.
  let resolvedBranchId: number | null = branchId
  if (!resolvedBranchId && tenantId) {
    resolvedBranchId = await getOrCreateMainBranchId({ tenantId })
  }

  try {
    const updateParams = {
      id,
      tenant_id: tenantId,
      branch_id: resolvedBranchId,
      role_id: roleId,
      full_name_en: updates.fullNameEn ?? null,
      full_name_ar: updates.fullNameAr ?? null,
      username: updates.username ?? null,
      email: updates.email ?? null,
      mobile: updates.mobile ?? null,
      address: updates.address ?? null,
      zip_code: updates.zipCode ?? null,
      country: updates.country ?? null,
      status: updates.status ?? null,
      password_hash: passwordHash,
      updated_at: now,
      updated_by: null,
    }

    await pool.query(
      `
      UPDATE users
      SET
        tenant_id = COALESCE(:tenant_id, tenant_id),
        branch_id = COALESCE(:branch_id, branch_id),
        role_id = COALESCE(:role_id, role_id),
        full_name_en = COALESCE(:full_name_en, full_name_en),
        full_name_ar = COALESCE(:full_name_ar, full_name_ar),
        username = COALESCE(:username, username),
        email = COALESCE(:email, email),
        mobile = COALESCE(:mobile, mobile),
        address = COALESCE(:address, address),
        zip_code = COALESCE(:zip_code, zip_code),
        country = COALESCE(:country, country),
        status = COALESCE(:status, status),
        password_hash = COALESCE(:password_hash, password_hash),
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
        branch_id,
        role_id,
        full_name_en,
        full_name_ar,
        username,
        email,
        mobile,
        status,
        address,
        zip_code,
        country,
        last_login_at,
        created_at,
        created_by,
        updated_at,
        updated_by
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    )
    const row = (rows as any[])[0]
    if (!row) return jsonError(404, "NOT_FOUND", "User not found")
    return jsonOk(rowToUser(row))
  } catch (err: any) {
    const message =
      err?.code === "ER_DUP_ENTRY"
        ? "Duplicate username/email/user code"
        : err?.message ?? "Failed to update user"
    return jsonError(400, "BAD_REQUEST", message)
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const auth = requirePermission(PERMISSIONS.USERS.DELETE)
  if (!auth.ok) return auth.response

  const id = toInt(params.id)
  if (!id) return jsonError(400, "BAD_REQUEST", "Invalid id")

  try {
    const pool = getMysqlPool()
    const [result] = await pool.query(`DELETE FROM users WHERE id = ?`, [id])
    const affected = (result as any).affectedRows ?? 0
    if (affected === 0) return jsonError(404, "NOT_FOUND", "User not found")
    return jsonOk({ ok: true })
  } catch (err: any) {
    return jsonError(400, "BAD_REQUEST", err?.message ?? "Failed to delete user")
  }
}

