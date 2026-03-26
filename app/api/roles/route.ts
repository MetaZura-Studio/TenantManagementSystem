import { requirePermission, PERMISSIONS } from "@/app/api/_platform/auth"
import { jsonError, jsonOk } from "@/app/api/_platform/http"
import type { Role } from "@/features/roles/types"
import { createRole, listRoles } from "@/app/api/roles/_store"

export async function GET() {
  const auth = requirePermission(PERMISSIONS.ROLES.VIEW)
  if (!auth.ok) return auth.response

  return jsonOk(listRoles())
}

export async function POST(req: Request) {
  const auth = requirePermission(PERMISSIONS.ROLES.CREATE)
  if (!auth.ok) return auth.response

  let body: Omit<Role, "id" | "createdAt" | "updatedAt">
  try {
    body = (await req.json()) as Omit<Role, "id" | "createdAt" | "updatedAt">
  } catch {
    return jsonError(400, "BAD_REQUEST", "Invalid JSON body")
  }

  if (!body?.roleName || !body?.status || !Array.isArray(body.permissions)) {
    return jsonError(400, "BAD_REQUEST", "Missing required role fields")
  }

  const created = createRole(body)
  return jsonOk(created, { status: 201 })
}

