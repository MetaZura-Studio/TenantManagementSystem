import { getSessionFromCookies } from "@/app/api/_platform/auth"
import { jsonError, jsonOk } from "@/app/api/_platform/http"
import { resolvePermissionsForRole } from "@/lib/auth/rbac-model"

export async function GET() {
  const session = getSessionFromCookies()
  if (!session) {
    return jsonError(401, "UNAUTHORIZED", "Not authenticated")
  }
  const user = {
    ...session.user,
    permissions:
      session.user.permissions && session.user.permissions.length > 0
        ? session.user.permissions
        : resolvePermissionsForRole(session.user.role),
  }
  return jsonOk({ user })
}

