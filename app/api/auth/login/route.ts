import {
  createSessionToken,
  setSessionCookie,
  type SessionPayload,
} from "@/app/api/_platform/auth"
import { jsonError, jsonOk } from "@/app/api/_platform/http"
import { prisma } from "@/lib/server/prisma"

export const runtime = "nodejs"

type LoginBody = {
  email?: string
  password?: string
}

function getSuperAdminDefaults() {
  return {
    fullName: process.env.ADMIN_NAME || "Super Admin",
    email: (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase(),
    password: process.env.ADMIN_PASSWORD || "admin123",
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

async function verifyPassword(password: string, stored: string) {
  if (!stored.startsWith("scrypt$")) return false
  const parts = stored.split("$")
  // scrypt$N=...,r=...,p=<saltB64><hashB64>
  // Expected: scrypt$<params>$<saltB64>$<hashB64>
  if (parts.length !== 4) return false
  const paramsStr = parts[1] || ""
  const saltB64 = parts[2] || ""
  const hashB64 = parts[3] || ""

  const N = Number(paramsStr.match(/N=(\d+)/)?.[1] || 0)
  const r = Number(paramsStr.match(/r=(\d+)/)?.[1] || 0)
  const p = Number(paramsStr.match(/p=(\d+)/)?.[1] || 0)
  if (!N || !r || !p) return false

  const salt = Buffer.from(saltB64, "base64")
  const expected = Buffer.from(hashB64, "base64")
  if (!salt.length || !expected.length) return false

  const { scrypt, timingSafeEqual } = await import("crypto")
  const derived: Buffer = await new Promise((resolve, reject) => {
    scrypt(password, salt, expected.length, { N, r, p }, (err, buf) => {
      if (err) reject(err)
      else resolve(buf as Buffer)
    })
  })
  if (derived.length !== expected.length) return false
  return timingSafeEqual(derived, expected)
}

async function ensureSuperAdminSeed() {
  const defaults = getSuperAdminDefaults()
  const existing = await prisma.super_admin_users.findFirst({
    where: { email: defaults.email },
    select: { id: true },
  })
  if (existing?.id) return

  const passwordHash = await hashPassword(defaults.password)
  await prisma.super_admin_users.create({
    data: {
      full_name: defaults.fullName,
      email: defaults.email,
      mobile: null,
      password_hash: passwordHash,
      status: "ACTIVE",
      last_login_at: null,
    } as any,
  })
}

export async function POST(req: Request) {
  let body: LoginBody
  try {
    body = (await req.json()) as LoginBody
  } catch {
    return jsonError(400, "BAD_REQUEST", "Invalid JSON body")
  }

  const email = (body.email || "").trim().toLowerCase()
  const password = body.password || ""
  if (!email || !password) {
    return jsonError(400, "BAD_REQUEST", "Email and password are required")
  }

  try {
    await ensureSuperAdminSeed()

    // 1) Super admin users
    const sa = await prisma.super_admin_users.findFirst({
      where: { email },
    })
    if (sa) {
      const ok = sa.status?.toUpperCase?.() !== "INACTIVE" && (await verifyPassword(password, sa.password_hash))
      if (!ok) return jsonError(401, "UNAUTHORIZED", "Invalid credentials")

      await prisma.super_admin_users.update({
        where: { id: sa.id },
        data: { last_login_at: new Date() } as any,
      })

      const payload: SessionPayload = {
        user: {
          id: `super-admin-${sa.id}`,
          name: sa.full_name || "Super Admin",
          email: sa.email,
          role: "admin",
          permissions: ["*"],
        },
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
      }

      const token = createSessionToken(payload)
      setSessionCookie(token, 60 * 60 * 8)
      return jsonOk({ user: payload.user })
    }

    // 2) Tenant users
    const user = await prisma.users.findFirst({
      where: { email },
      select: { id: true, full_name_en: true, email: true, password_hash: true, status: true },
    })
    if (!user) return jsonError(401, "UNAUTHORIZED", "Invalid credentials")
    if (String(user.status || "").toUpperCase() !== "ACTIVE") {
      return jsonError(401, "UNAUTHORIZED", "User is not active")
    }
    const ok = await verifyPassword(password, user.password_hash)
    if (!ok) return jsonError(401, "UNAUTHORIZED", "Invalid credentials")

    await prisma.users.update({
      where: { id: user.id },
      data: { last_login_at: new Date() } as any,
    })

    const payload: SessionPayload = {
      user: {
        id: `user-${user.id}`,
        name: user.full_name_en || email.split("@")[0] || "User",
        email,
        role: "viewer",
      },
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
    }

    const token = createSessionToken(payload)
    setSessionCookie(token, 60 * 60 * 8)
    return jsonOk({ user: payload.user })
  } catch (err: any) {
    return jsonError(400, "BAD_REQUEST", err?.message ?? "Login failed")
  }

  // Unreachable
}

