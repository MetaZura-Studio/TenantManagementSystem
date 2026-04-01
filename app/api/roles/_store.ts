import type { Permission, Role } from "@/features/roles/types"
import { RBAC_MODULES } from "@/lib/utils/rbac"
import { prisma } from "@/lib/server/prisma"

const ACTION_KEYS = ["view", "create", "edit", "delete", "print"] as const
type ActionKey = (typeof ACTION_KEYS)[number]

function toId(raw: string) {
  const id = Number.parseInt(raw, 10)
  return Number.isFinite(id) ? id : null
}

function roleRowToRole(
  row: any,
  permissionsByModule: Map<string, Set<ActionKey>>
): Role {
  const permissions: Permission[] = RBAC_MODULES.map((module) => {
    const allowed = permissionsByModule.get(module) ?? new Set<ActionKey>()
    return {
      module,
      view: allowed.has("view"),
      create: allowed.has("create"),
      edit: allowed.has("edit"),
      delete: allowed.has("delete"),
      print: allowed.has("print"),
    }
  })

  return {
    id: String(row.id),
    roleName: row.name_en,
    description: row.description ?? undefined,
    status: row.status,
    permissions,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function getPermissionsByModuleForRole(roleId: number) {
  const rolePerms = await prisma.role_permissions.findMany({
    where: { role_id: roleId },
    select: { permission_id: true },
  })
  const permissionIds = rolePerms.map((r) => Number(r.permission_id)).filter((n) => Number.isFinite(n))
  const perms =
    permissionIds.length > 0
      ? await prisma.permissions.findMany({
          where: { id: { in: permissionIds } },
          select: { module_key: true, action_key: true },
        })
      : []

  const map = new Map<string, Set<ActionKey>>()
  for (const r of perms as any[]) {
    const moduleKey = String(r.module_key)
    const action = String(r.action_key) as ActionKey
    if (!ACTION_KEYS.includes(action)) continue
    if (!map.has(moduleKey)) map.set(moduleKey, new Set<ActionKey>())
    map.get(moduleKey)!.add(action)
  }
  return map
}

async function ensurePermissionIds(
  perms: Array<{ module_key: string; action_key: ActionKey }>
) {
  const ids = new Map<string, number>()

  // 1) Read existing
  const existing = await prisma.permissions.findMany({
    select: { id: true, module_key: true, action_key: true },
  })
  for (const r of existing as any[]) {
    ids.set(`${r.module_key}:${r.action_key}`, Number(r.id))
  }

  // 2) Insert missing (ignore duplicates)
  const now = new Date()
  for (const p of perms) {
    const key = `${p.module_key}:${p.action_key}`
    if (ids.has(key)) continue
    try {
      const created = await prisma.permissions.create({
        data: {
          module_key: p.module_key,
          action_key: p.action_key,
          created_at: now,
          created_by: null,
          updated_at: now,
          updated_by: null,
        } as any,
        select: { id: true },
      })
      ids.set(key, Number(created.id))
    } catch (err: any) {
      if (err?.code !== "P2002" && err?.code !== "ER_DUP_ENTRY") throw err
      const row = await prisma.permissions.findFirst({
        where: { module_key: p.module_key, action_key: p.action_key } as any,
        select: { id: true },
      })
      if (row) ids.set(key, Number(row.id))
    }
  }

  return ids
}

function flattenPermissionMatrix(permissions: Permission[]) {
  const flat: Array<{ module_key: string; action_key: ActionKey }> = []
  for (const p of permissions) {
    const module_key = p.module
    if (p.view) flat.push({ module_key, action_key: "view" })
    if (p.create) flat.push({ module_key, action_key: "create" })
    if (p.edit) flat.push({ module_key, action_key: "edit" })
    if (p.delete) flat.push({ module_key, action_key: "delete" })
    if (p.print) flat.push({ module_key, action_key: "print" })
  }
  return flat
}

export async function listRoles() {
  const rows = await prisma.roles.findMany({
    select: { id: true, name_en: true, description: true, status: true, created_at: true, updated_at: true },
    orderBy: { id: "desc" },
  })

  const out: Role[] = []
  for (const row of rows as any[]) {
    const perms = await getPermissionsByModuleForRole(Number(row.id))
    out.push(roleRowToRole(row, perms))
  }
  return out
}

export async function getRole(roleId: string) {
  const id = toId(roleId)
  if (!id) return undefined

  const row = await prisma.roles.findUnique({
    where: { id },
    select: { id: true, name_en: true, description: true, status: true, created_at: true, updated_at: true },
  })
  if (!row) return undefined
  const perms = await getPermissionsByModuleForRole(id)
  return roleRowToRole(row, perms)
}

export async function createRole(
  payload: Omit<Role, "id" | "createdAt" | "updatedAt">
) {
  const now = new Date()

  const createdRole = await prisma.roles.create({
    data: {
      tenant_id: null,
      name_en: payload.roleName,
      name_ar: null,
      description: payload.description ?? null,
      status: payload.status,
      created_at: now,
      created_by: null,
      updated_at: now,
      updated_by: null,
    } as any,
    select: { id: true },
  })
  const roleId = Number(createdRole.id)

  // permissions matrix -> normalized join tables
  const flat = flattenPermissionMatrix(payload.permissions)
  const permIds = await ensurePermissionIds(flat)

  for (const p of flat) {
    const pid = permIds.get(`${p.module_key}:${p.action_key}`)
    if (!pid) continue
    try {
      await prisma.role_permissions.create({
        data: {
          role_id: roleId,
          permission_id: pid,
          created_at: now,
          created_by: null,
          updated_at: now,
          updated_by: null,
        } as any,
      })
    } catch (err: any) {
      if (err?.code !== "P2002" && err?.code !== "ER_DUP_ENTRY") throw err
    }
  }

  return (await getRole(String(roleId)))!
}

export async function updateRole(roleId: string, updates: Partial<Role>) {
  const id = toId(roleId)
  if (!id) return null

  const now = new Date()

  // Update role basic fields
  await prisma.roles.update({
    where: { id },
    data: {
      name_en: updates.roleName ?? undefined,
      description: updates.description ?? undefined,
      status: updates.status ?? undefined,
      updated_at: now,
      updated_by: null,
    } as any,
  })

  // Update permissions if provided
  if (Array.isArray(updates.permissions)) {
    await prisma.role_permissions.deleteMany({ where: { role_id: id } })

    const flat = flattenPermissionMatrix(updates.permissions)
    const permIds = await ensurePermissionIds(flat)
    for (const p of flat) {
      const pid = permIds.get(`${p.module_key}:${p.action_key}`)
      if (!pid) continue
      await prisma.role_permissions.create({
        data: {
          role_id: id,
          permission_id: pid,
          created_at: now,
          created_by: null,
          updated_at: now,
          updated_by: null,
        } as any,
      })
    }
  }

  const role = await getRole(String(id))
  return role ?? null
}

export async function deleteRole(roleId: string) {
  const id = toId(roleId)
  if (!id) return false

  const existing = await prisma.roles.findUnique({ where: { id }, select: { id: true } })
  if (!existing) return false
  await prisma.role_permissions.deleteMany({ where: { role_id: id } })
  await prisma.roles.delete({ where: { id } })
  return true
}

