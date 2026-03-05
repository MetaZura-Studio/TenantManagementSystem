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

export function hasPermission(permission: string): boolean {
  // Mock: admin has all permissions
  return true
}

export function canAccess(module: string, action: string): boolean {
  return hasPermission(`${module}:${action}`)
}
