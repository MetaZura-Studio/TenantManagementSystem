import { requirePermission, PERMISSIONS } from "@/app/api/_platform/auth"
import { jsonError, jsonOk } from "@/app/api/_platform/http"
import type { Role } from "@/features/roles/types"
import { deleteRole, getRole, updateRole } from "@/app/api/roles/_store"

export async function GET(
  _req: Request,
  { params }: { params: { roleId: string } }
) {
  const auth = requirePermission(PERMISSIONS.ROLES.VIEW)
  if (!auth.ok) return auth.response

  const role = await getRole(params.roleId)
  if (!role) return jsonError(404, "NOT_FOUND", "Role not found")
  return jsonOk(role)
}

export async function PATCH(
  req: Request,
  { params }: { params: { roleId: string } }
) {
  const auth = requirePermission(PERMISSIONS.ROLES.UPDATE)
  if (!auth.ok) return auth.response

  let updates: Partial<Role>
  try {
    updates = (await req.json()) as Partial<Role>
  } catch {
    return jsonError(400, "BAD_REQUEST", "Invalid JSON body")
  }

  const updated = await updateRole(params.roleId, updates)
  if (!updated) return jsonError(404, "NOT_FOUND", "Role not found")
  return jsonOk(updated)
}

export async function DELETE(
  _req: Request,
  { params }: { params: { roleId: string } }
) {
  const auth = requirePermission(PERMISSIONS.ROLES.DELETE)
  if (!auth.ok) return auth.response

  const ok = await deleteRole(params.roleId)
  if (!ok) return jsonError(404, "NOT_FOUND", "Role not found")
  return jsonOk({ ok: true })
}

