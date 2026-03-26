import type { Role } from "@/features/roles/types"
import { getRolePermissions } from "@/lib/utils/rbac"

/**
 * Server-side in-memory store for Roles.
 *
 * Rationale:
 * - The existing Zustand store is persisted via localStorage and is not safe to import in server route handlers.
 * - Dev2/Dev3 will replace this with MySQL persistence later; API contract should remain stable.
 */

let roles: Role[] | null = null

function nowIso() {
  return new Date().toISOString()
}

function ensureSeeded() {
  if (roles) return
  const now = nowIso()
  roles = [
    {
      id: "role-owner",
      roleName: "Owner",
      description: "Full administrative access.",
      status: "Active",
      permissions: getRolePermissions("Owner"),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "role-seller",
      roleName: "Seller",
      description: "Customer-facing role.",
      status: "Active",
      permissions: getRolePermissions("Seller"),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "role-supervisor",
      roleName: "Supervisor",
      description: "Management role.",
      status: "Active",
      permissions: getRolePermissions("Supervisor"),
      createdAt: now,
      updatedAt: now,
    },
  ]
}

export function listRoles() {
  ensureSeeded()
  return roles!
}

export function getRole(roleId: string) {
  ensureSeeded()
  return roles!.find((r) => r.id === roleId)
}

export function createRole(
  payload: Omit<Role, "id" | "createdAt" | "updatedAt">
): Role {
  ensureSeeded()
  const now = nowIso()
  const newRole: Role = {
    id: `role-${Date.now()}`,
    ...payload,
    createdAt: now,
    updatedAt: now,
  }
  roles = [...roles!, newRole]
  return newRole
}

export function updateRole(roleId: string, updates: Partial<Role>) {
  ensureSeeded()
  const idx = roles!.findIndex((r) => r.id === roleId)
  if (idx === -1) return null
  const next: Role = {
    ...roles![idx],
    ...updates,
    id: roles![idx].id,
    updatedAt: nowIso(),
  }
  roles = roles!.map((r, i) => (i === idx ? next : r))
  return next
}

export function deleteRole(roleId: string) {
  ensureSeeded()
  const before = roles!.length
  roles = roles!.filter((r) => r.id !== roleId)
  return roles!.length !== before
}

