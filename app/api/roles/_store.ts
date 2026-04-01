import type { Permission, Role } from "@/features/roles/types"
import { RBAC_MODULES } from "@/lib/utils/rbac"
import { getMysqlPool } from "@/lib/server/mysql"

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
  const pool = getMysqlPool()
  const [rows] = await pool.query(
    `
    SELECT p.module_key, p.action_key
    FROM role_permissions rp
    JOIN permissions p ON p.id = rp.permission_id
    WHERE rp.role_id = ?
    `,
    [roleId]
  )

  const map = new Map<string, Set<ActionKey>>()
  for (const r of rows as any[]) {
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
  const pool = getMysqlPool()
  const ids = new Map<string, number>()

  // 1) Read existing
  const [existing] = await pool.query(
    `
    SELECT id, module_key, action_key
    FROM permissions
    `
  )
  for (const r of existing as any[]) {
    ids.set(`${r.module_key}:${r.action_key}`, Number(r.id))
  }

  // 2) Insert missing (ignore duplicates)
  const now = new Date()
  for (const p of perms) {
    const key = `${p.module_key}:${p.action_key}`
    if (ids.has(key)) continue
    try {
      const [result] = await pool.query(
        `
        INSERT INTO permissions (module_key, action_key, created_at, created_by, updated_at, updated_by)
        VALUES (?, ?, ?, NULL, ?, NULL)
        `,
        [p.module_key, p.action_key, now, now]
      )
      ids.set(key, Number((result as any).insertId))
    } catch (err: any) {
      if (err?.code !== "ER_DUP_ENTRY") throw err
      // Someone else inserted concurrently; re-select id.
      const [rows] = await pool.query(
        `SELECT id FROM permissions WHERE module_key = ? AND action_key = ? LIMIT 1`,
        [p.module_key, p.action_key]
      )
      const row = (rows as any[])[0]
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
  const pool = getMysqlPool()
  const [rows] = await pool.query(
    `
    SELECT id, name_en, description, status, created_at, updated_at
    FROM roles
    ORDER BY id DESC
    `
  )

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

  const pool = getMysqlPool()
  const [rows] = await pool.query(
    `
    SELECT id, name_en, description, status, created_at, updated_at
    FROM roles
    WHERE id = ?
    LIMIT 1
    `,
    [id]
  )
  const row = (rows as any[])[0]
  if (!row) return undefined
  const perms = await getPermissionsByModuleForRole(id)
  return roleRowToRole(row, perms)
}

export async function createRole(
  payload: Omit<Role, "id" | "createdAt" | "updatedAt">
) {
  const pool = getMysqlPool()
  const now = new Date()

  const [result] = await pool.query(
    `
    INSERT INTO roles (tenant_id, name_en, name_ar, description, status, created_at, created_by, updated_at, updated_by)
    VALUES (NULL, ?, NULL, ?, ?, ?, NULL, ?, NULL)
    `,
    [payload.roleName, payload.description ?? null, payload.status, now, now]
  )
  const roleId = Number((result as any).insertId)

  // permissions matrix -> normalized join tables
  const flat = flattenPermissionMatrix(payload.permissions)
  const permIds = await ensurePermissionIds(flat)

  for (const p of flat) {
    const pid = permIds.get(`${p.module_key}:${p.action_key}`)
    if (!pid) continue
    try {
      await pool.query(
        `
        INSERT INTO role_permissions (role_id, permission_id, created_at, created_by, updated_at, updated_by)
        VALUES (?, ?, ?, NULL, ?, NULL)
        `,
        [roleId, pid, now, now]
      )
    } catch (err: any) {
      if (err?.code !== "ER_DUP_ENTRY") throw err
    }
  }

  return (await getRole(String(roleId)))!
}

export async function updateRole(roleId: string, updates: Partial<Role>) {
  const id = toId(roleId)
  if (!id) return null

  const pool = getMysqlPool()
  const now = new Date()

  // Update role basic fields
  await pool.query(
    `
    UPDATE roles
    SET
      name_en = COALESCE(?, name_en),
      description = COALESCE(?, description),
      status = COALESCE(?, status),
      updated_at = ?,
      updated_by = NULL
    WHERE id = ?
    `,
    [
      updates.roleName ?? null,
      updates.description ?? null,
      updates.status ?? null,
      now,
      id,
    ]
  )

  // Update permissions if provided
  if (Array.isArray(updates.permissions)) {
    await pool.query(`DELETE FROM role_permissions WHERE role_id = ?`, [id])

    const flat = flattenPermissionMatrix(updates.permissions)
    const permIds = await ensurePermissionIds(flat)
    for (const p of flat) {
      const pid = permIds.get(`${p.module_key}:${p.action_key}`)
      if (!pid) continue
      await pool.query(
        `
        INSERT INTO role_permissions (role_id, permission_id, created_at, created_by, updated_at, updated_by)
        VALUES (?, ?, ?, NULL, ?, NULL)
        `,
        [id, pid, now, now]
      )
    }
  }

  const role = await getRole(String(id))
  return role ?? null
}

export async function deleteRole(roleId: string) {
  const id = toId(roleId)
  if (!id) return false

  const pool = getMysqlPool()
  await pool.query(`DELETE FROM role_permissions WHERE role_id = ?`, [id])
  const [result] = await pool.query(`DELETE FROM roles WHERE id = ?`, [id])
  const affected = (result as any).affectedRows ?? 0
  return affected > 0
}

