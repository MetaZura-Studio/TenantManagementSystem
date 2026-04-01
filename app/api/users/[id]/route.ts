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

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const auth = requirePermission(PERMISSIONS.USERS.VIEW)
  if (!auth.ok) return auth.response

  const id = toInt(params.id)
  if (!id) return jsonError(400, "BAD_REQUEST", "Invalid id")

  try {
    const row = await prisma.users.findUnique({ where: { id } })
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
    const row = await prisma.users.update({
      where: { id },
      data: {
        tenant_id: tenantId ?? undefined,
        branch_id: resolvedBranchId ?? undefined,
        role_id: roleId ?? undefined,
        full_name_en: updates.fullNameEn ?? undefined,
        full_name_ar: updates.fullNameAr ?? undefined,
        username: updates.username ?? undefined,
        email: updates.email ?? undefined,
        mobile: updates.mobile ?? undefined,
        address: updates.address ?? undefined,
        zip_code: updates.zipCode ?? undefined,
        country: updates.country ?? undefined,
        status: updates.status ?? undefined,
        password_hash: passwordHash ?? undefined,
        updated_at: now,
        updated_by: null,
      } as any,
    })
    return jsonOk(rowToUser(row))
  } catch (err: any) {
    const message =
      err?.code === "P2002" || err?.code === "ER_DUP_ENTRY"
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
    const existing = await prisma.users.findUnique({ where: { id }, select: { id: true } })
    if (!existing) return jsonError(404, "NOT_FOUND", "User not found")
    await prisma.users.delete({ where: { id } })
    return jsonOk({ ok: true })
  } catch (err: any) {
    return jsonError(400, "BAD_REQUEST", err?.message ?? "Failed to delete user")
  }
}

