import { cookies } from "next/headers"
import { createHmac, timingSafeEqual } from "crypto"
import { jsonError } from "@/app/api/_platform/http"
import { PERMISSIONS, hasPermissionForSession } from "@/lib/auth/permissions"
import { resolvePermissionsForRole } from "@/lib/auth/rbac-model"

export type AuthUser = {
  id: string
  name: string
  email: string
  role: string
  permissions?: string[]
}

export type SessionPayload = {
  user: AuthUser
  exp: number // unix seconds
}

const COOKIE_NAME = "tms_session"

function base64UrlEncode(input: string | Buffer) {
  const buf = typeof input === "string" ? Buffer.from(input) : input
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
}

function base64UrlDecodeToString(input: string) {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/")
  const padLen = (4 - (padded.length % 4)) % 4
  const withPad = padded + "=".repeat(padLen)
  return Buffer.from(withPad, "base64").toString("utf8")
}

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET
  const isDev = process.env.NODE_ENV !== "production"

  if (!secret) {
    // Dev convenience: allow boot without env, but never allow this in prod.
    if (!isDev) {
      throw new Error("AUTH_SECRET is required in production.")
    }
    return "dev-only-insecure-secret-change-me"
  }

  if (secret.length < 16 && !isDev) {
    throw new Error("AUTH_SECRET must be at least 16 characters in production.")
  }

  return secret
}

function sign(data: string) {
  return createHmac("sha256", getAuthSecret()).update(data).digest()
}

export function createSessionToken(payload: SessionPayload) {
  const json = JSON.stringify(payload)
  const data = base64UrlEncode(json)
  const sig = base64UrlEncode(sign(data))
  return `${data}.${sig}`
}

export function verifySessionToken(token: string): SessionPayload | null {
  const [data, sig] = token.split(".")
  if (!data || !sig) return null

  const expected = sign(data)
  const provided = Buffer.from(
    sig.replace(/-/g, "+").replace(/_/g, "/"),
    "base64"
  )
  if (provided.length !== expected.length) return null
  if (!timingSafeEqual(provided, expected)) return null

  try {
    const raw = base64UrlDecodeToString(data)
    const payload = JSON.parse(raw) as SessionPayload
    if (!payload?.user?.id || !payload?.exp) return null
    if (payload.exp <= Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}

export function setSessionCookie(token: string, maxAgeSeconds?: number) {
  const isProd = process.env.NODE_ENV === "production"
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    ...(typeof maxAgeSeconds === "number" ? { maxAge: maxAgeSeconds } : {}),
  })
}

export function clearSessionCookie() {
  cookies().set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  })
}

export function getSessionFromCookies(): SessionPayload | null {
  const token = cookies().get(COOKIE_NAME)?.value
  if (!token) return null
  return verifySessionToken(token)
}

export function requireSession() {
  const session = getSessionFromCookies()
  if (!session) {
    return { ok: false as const, response: jsonError(401, "UNAUTHORIZED", "Not authenticated") }
  }
  return { ok: true as const, session }
}

export function requirePermission(permission: string) {
  const res = requireSession()
  if (!res.ok) return res

  const hydratedSession = {
    ...res.session,
    user: {
      ...res.session.user,
      permissions:
        res.session.user.permissions && res.session.user.permissions.length > 0
          ? res.session.user.permissions
          : resolvePermissionsForRole(res.session.user.role),
    },
  }

  const allowed = hasPermissionForSession(hydratedSession, permission)

  if (!allowed) {
    return {
      ok: false as const,
      response: jsonError(403, "FORBIDDEN", "Missing permission"),
    }
  }

  return { ok: true as const, session: hydratedSession }
}

// Re-export permission constants for convenience in route handlers.
export { PERMISSIONS }

