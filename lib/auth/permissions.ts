// Permission constants and helpers
export const PERMISSIONS = {
  TENANTS: {
    VIEW: "tenants:view",
    CREATE: "tenants:create",
    UPDATE: "tenants:update",
    DELETE: "tenants:delete",
  },
  BRANCHES: {
    VIEW: "branches:view",
    CREATE: "branches:create",
    UPDATE: "branches:update",
    DELETE: "branches:delete",
  },
  PLANS: {
    VIEW: "plans:view",
    CREATE: "plans:create",
    UPDATE: "plans:update",
    DELETE: "plans:delete",
  },
  SUBSCRIPTIONS: {
    VIEW: "subscriptions:view",
    CREATE: "subscriptions:create",
    UPDATE: "subscriptions:update",
    DELETE: "subscriptions:delete",
  },
  USERS: {
    VIEW: "users:view",
    CREATE: "users:create",
    UPDATE: "users:update",
    DELETE: "users:delete",
  },
  ROLES: {
    VIEW: "roles:view",
    CREATE: "roles:create",
    UPDATE: "roles:update",
    DELETE: "roles:delete",
  },
  INVOICES: {
    VIEW: "invoices:view",
    CREATE: "invoices:create",
    UPDATE: "invoices:update",
    DELETE: "invoices:delete",
  },
  PAYMENTS: {
    VIEW: "payments:view",
    CREATE: "payments:create",
    UPDATE: "payments:update",
    DELETE: "payments:delete",
  },
} as const

export type SessionLike = {
  user?: { role?: string; permissions?: string[] }
}

export function hasPermissionForSession(
  session: SessionLike | null | undefined,
  permission: string
): boolean {
  if (!session?.user) return false
  const role = session.user.role
  if (role === "admin") return true

  const perms = session.user.permissions || []
  if (perms.includes("*")) return true
  return perms.includes(permission)
}

/**
 * UI helper.
 *
 * Note: Many screens currently rely on a synchronous boolean return.
 * Dev1 keeps this API stable; UI can progressively adopt async `useSession()`.
 */
export function hasPermission(permission: string): boolean {
  // Until the UI adopts async session fetching, keep behavior conservative-but-safe:
  // - If no session is present client-side, we allow the UI (API is still enforced).
  // - When a client session is explicitly set (e.g. post-login), we enforce it.
  try {
    const raw = globalThis?.localStorage?.getItem("tms_client_session")
    if (!raw) return true
    const session = JSON.parse(raw) as SessionLike
    return hasPermissionForSession(session, permission)
  } catch {
    return true
  }
}

export function canAccess(module: string, action: string): boolean {
  return hasPermission(`${module}:${action}`)
}
