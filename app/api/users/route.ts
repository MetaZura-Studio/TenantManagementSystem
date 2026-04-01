import { requirePermission, PERMISSIONS } from "@/app/api/_platform/auth"
import { jsonError, jsonOk } from "@/app/api/_platform/http"
import { prisma } from "@/lib/server/prisma"
import type { User } from "@/features/users/types"

export const runtime = "nodejs"

function toInt(raw: any) {
  const n = Number.parseInt(String(raw), 10)
  return Number.isFinite(n) ? n : null
}

async function getOrCreateMainBranchId(args: { tenantId: number }) {
  const existing = await prisma.branches.findFirst({
    where: { tenant_id: args.tenantId },
    orderBy: { id: "asc" },
    select: { id: true },
  })
  if (existing?.id) return Number(existing.id)

  const now = new Date()
  const created = await prisma.branches.create({
    data: {
      tenant_id: args.tenantId,
      branch_code: "MAIN",
      name_en: "Main Branch",
      name_ar: null,
      address: null,
      city: null,
      state: null,
      zip_code: null,
      country: null,
      phone: null,
      email: null,
      contact_name: null,
      remarks: null,
      status: "ACTIVE",
      created_at: now,
      created_by: null,
      updated_at: now,
      updated_by: null,
    } as any,
    select: { id: true },
  })
  return Number(created.id)
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
    const rows = await prisma.users.findMany({ orderBy: { id: "desc" } })
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

    const created = await prisma.users.create({
      data: params as any,
    })
    return jsonOk(rowToUser(created), { status: 201 })
  } catch (err: any) {
    const message =
      err?.code === "P2002" || err?.code === "ER_DUP_ENTRY"
        ? "Duplicate username/email/user code"
        : err?.message ?? "Failed to create user"
    return jsonError(400, "BAD_REQUEST", message)
  }
}

