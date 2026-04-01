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

export async function GET() {
  const auth = requirePermission(PERMISSIONS.USERS.VIEW)
  if (!auth.ok) return auth.response

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
      ORDER BY id DESC
      `
    )
    return jsonOk((rows as any[]).map(rowToUser))
  } catch (err: any) {
    return jsonError(400, "BAD_REQUEST", err?.message ?? "Failed to load users")
  }
}

export async function POST(req: Request) {
  const auth = requirePermission(PERMISSIONS.USERS.CREATE)
  if (!auth.ok) return auth.response

  let body: any
  try {
    body = await req.json()
  } catch {
    return jsonError(400, "BAD_REQUEST", "Invalid JSON body")
  }

  const tenantId = toInt(body.tenantId)
  const roleId = toInt(body.roleId)
  const branchIdRaw = body.branchId
  const branchId = branchIdRaw != null && String(branchIdRaw).trim() !== "" ? toInt(branchIdRaw) : null
  const password = String(body.password || "").trim()

  if (!tenantId || !roleId || !body?.fullNameEn || !body?.fullNameAr || !body?.username || !body?.email) {
    return jsonError(400, "BAD_REQUEST", "Missing required user fields")
  }
  if (!password || password.length < 6) {
    return jsonError(400, "BAD_REQUEST", "Password must be at least 6 characters")
  }

  try {
    const pool = getMysqlPool()
    const now = new Date()

    const resolvedBranchId = branchId ?? (await getOrCreateMainBranchId({ tenantId }))
    const passwordHash = await hashPassword(password)

    const userCode = `U${Date.now().toString().slice(-8)}`

    const params = {
      user_code: userCode,
      tenant_id: tenantId,
      branch_id: resolvedBranchId,
      role_id: roleId,
      full_name_en: String(body.fullNameEn),
      full_name_ar: String(body.fullNameAr),
      username: String(body.username),
      email: String(body.email),
      mobile: body.mobile ?? null,
      password_hash: passwordHash,
      address: body.address ?? null,
      city: body.city ?? null,
      state: body.state ?? null,
      zip_code: body.zipCode ?? null,
      country: body.country ?? null,
      status: body.status ?? "ACTIVE",
      last_login_at: null,
      created_at: now,
      created_by: null,
      updated_at: now,
      updated_by: null,
    }

    const [result] = await pool.query(
      `
      INSERT INTO users (
        user_code,
        tenant_id,
        branch_id,
        role_id,
        full_name_en,
        full_name_ar,
        username,
        email,
        mobile,
        password_hash,
        address,
        city,
        state,
        zip_code,
        country,
        status,
        last_login_at,
        created_at,
        created_by,
        updated_at,
        updated_by
      ) VALUES (
        :user_code,
        :tenant_id,
        :branch_id,
        :role_id,
        :full_name_en,
        :full_name_ar,
        :username,
        :email,
        :mobile,
        :password_hash,
        :address,
        :city,
        :state,
        :zip_code,
        :country,
        :status,
        :last_login_at,
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
      [insertedId]
    )
    const row = (rows as any[])[0]
    return jsonOk(rowToUser(row), { status: 201 })
  } catch (err: any) {
    const message =
      err?.code === "ER_DUP_ENTRY"
        ? "Duplicate username/email/user code"
        : err?.message ?? "Failed to create user"
    return jsonError(400, "BAD_REQUEST", message)
  }
}

