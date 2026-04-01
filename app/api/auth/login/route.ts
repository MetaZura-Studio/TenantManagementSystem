import {
  createSessionToken,
  setSessionCookie,
  type SessionPayload,
} from "@/app/api/_platform/auth"
import { jsonError, jsonOk } from "@/app/api/_platform/http"
import { getMysqlPool } from "@/lib/server/mysql"

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
  const pool = getMysqlPool()
  const defaults = getSuperAdminDefaults()
  const [rows] = await pool.query(`SELECT id, email FROM super_admin_users WHERE email = ? LIMIT 1`, [
    defaults.email,
  ])
  const existing = (rows as any[])[0]
  if (existing?.id) return

  const passwordHash = await hashPassword(defaults.password)
  await pool.query(
    `
    INSERT INTO super_admin_users (full_name, email, mobile, password_hash, status, last_login_at)
    VALUES (?, ?, NULL, ?, 'ACTIVE', NULL)
    `,
    [defaults.fullName, defaults.email, passwordHash]
  )
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
    const pool = getMysqlPool()

    // 1) Super admin users
    const [saRows] = await pool.query(
      `SELECT id, full_name, email, password_hash, status FROM super_admin_users WHERE email = ? LIMIT 1`,
      [email]
    )
    const sa = (saRows as any[])[0]
    if (sa) {
      const ok = sa.status?.toUpperCase?.() !== "INACTIVE" && (await verifyPassword(password, sa.password_hash))
      if (!ok) return jsonError(401, "UNAUTHORIZED", "Invalid credentials")

      await pool.query(`UPDATE super_admin_users SET last_login_at = NOW() WHERE id = ?`, [sa.id])

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
    const [userRows] = await pool.query(
      `
      SELECT id, full_name_en, email, password_hash, status
      FROM users
      WHERE LOWER(email) = ?
      LIMIT 1
      `,
      [email]
    )
    const user = (userRows as any[])[0]
    if (!user) return jsonError(401, "UNAUTHORIZED", "Invalid credentials")
    if (String(user.status || "").toUpperCase() !== "ACTIVE") {
      return jsonError(401, "UNAUTHORIZED", "User is not active")
    }
    const ok = await verifyPassword(password, user.password_hash)
    if (!ok) return jsonError(401, "UNAUTHORIZED", "Invalid credentials")

    await pool.query(`UPDATE users SET last_login_at = NOW() WHERE id = ?`, [user.id])

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

