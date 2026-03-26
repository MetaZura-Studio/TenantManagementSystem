import {
  createSessionToken,
  setSessionCookie,
  type SessionPayload,
} from "@/app/api/_platform/auth"
import { jsonError, jsonOk } from "@/app/api/_platform/http"

type LoginBody = {
  email?: string
  password?: string
}

function getAdminCreds() {
  return {
    email: process.env.ADMIN_EMAIL || "admin@example.com",
    password: process.env.ADMIN_PASSWORD || "admin123",
  }
}

function resolveDevRoleForEmail(email: string) {
  const map: Record<string, string> = {
    [process.env.ADMIN_EMAIL?.toLowerCase() || "admin@example.com"]: "admin",
    "viewer@example.com": "viewer",
    "tenant.manager@example.com": "tenant_manager",
    "commercial.manager@example.com": "commercial_manager",
    "user.manager@example.com": "user_manager",
    "finance.manager@example.com": "finance_manager",
  }
  return map[email] || "viewer"
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

  const admin = getAdminCreds()
  // Dev-only auth: accept any of the known dev test emails with the shared password.
  // Replace with real user auth later.
  const allowedEmails = new Set([
    admin.email.toLowerCase(),
    "viewer@example.com",
    "tenant.manager@example.com",
    "commercial.manager@example.com",
    "user.manager@example.com",
    "finance.manager@example.com",
  ])

  if (!allowedEmails.has(email) || password !== admin.password) {
    return jsonError(401, "UNAUTHORIZED", "Invalid credentials")
  }

  const payload: SessionPayload = {
    user: {
      id: `user-${email}`,
      name: email.split("@")[0] || "User",
      email,
      role: resolveDevRoleForEmail(email),
    },
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8, // 8 hours
  }

  const token = createSessionToken(payload)
  setSessionCookie(token, 60 * 60 * 8)

  return jsonOk({ user: payload.user })
}

