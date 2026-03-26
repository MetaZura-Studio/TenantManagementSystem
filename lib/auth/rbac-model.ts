import { PERMISSIONS } from "@/lib/auth/permissions"

/**
 * Canonical RBAC model for this Admin Portal.
 *
 * This app uses string permissions (e.g. "tenants:view") as the source of truth.
 * MySQL-backed roles/permissions will replace this later; keep the interface stable.
 */

export type AppRole =
  | "admin"
  | "tenant_manager"
  | "commercial_manager"
  | "user_manager"
  | "finance_manager"
  | "viewer"

export function resolvePermissionsForRole(role: string): string[] {
  const r = (role || "").toLowerCase()

  if (r === "admin") return ["*"]

  // Dev-friendly baseline: least privilege by default.
  if (r === "viewer") {
    return [
      PERMISSIONS.TENANTS.VIEW,
      PERMISSIONS.BRANCHES.VIEW,
      PERMISSIONS.PLANS.VIEW,
      PERMISSIONS.SUBSCRIPTIONS.VIEW,
      PERMISSIONS.USERS.VIEW,
      PERMISSIONS.ROLES.VIEW,
      PERMISSIONS.INVOICES.VIEW,
      PERMISSIONS.PAYMENTS.VIEW,
    ]
  }

  if (r === "tenant_manager") {
    return [
      PERMISSIONS.TENANTS.VIEW,
      PERMISSIONS.TENANTS.CREATE,
      PERMISSIONS.TENANTS.UPDATE,
      PERMISSIONS.BRANCHES.VIEW,
      PERMISSIONS.BRANCHES.CREATE,
      PERMISSIONS.BRANCHES.UPDATE,
    ]
  }

  if (r === "commercial_manager") {
    return [
      PERMISSIONS.PLANS.VIEW,
      PERMISSIONS.PLANS.CREATE,
      PERMISSIONS.PLANS.UPDATE,
      PERMISSIONS.SUBSCRIPTIONS.VIEW,
      PERMISSIONS.SUBSCRIPTIONS.CREATE,
      PERMISSIONS.SUBSCRIPTIONS.UPDATE,
      PERMISSIONS.TENANTS.VIEW,
    ]
  }

  if (r === "user_manager") {
    return [
      PERMISSIONS.USERS.VIEW,
      PERMISSIONS.USERS.CREATE,
      PERMISSIONS.USERS.UPDATE,
      PERMISSIONS.ROLES.VIEW,
    ]
  }

  if (r === "finance_manager") {
    return [
      PERMISSIONS.INVOICES.VIEW,
      PERMISSIONS.INVOICES.CREATE,
      PERMISSIONS.INVOICES.UPDATE,
      PERMISSIONS.PAYMENTS.VIEW,
      PERMISSIONS.PAYMENTS.CREATE,
      PERMISSIONS.PAYMENTS.UPDATE,
      PERMISSIONS.TENANTS.VIEW,
    ]
  }

  return []
}

