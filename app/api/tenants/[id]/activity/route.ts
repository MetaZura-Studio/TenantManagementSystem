import { requirePermission, PERMISSIONS } from "@/app/api/_platform/auth"
import { jsonError, jsonOk } from "@/app/api/_platform/http"
import { prisma } from "@/lib/server/prisma"

export const runtime = "nodejs"

function toId(raw: string) {
  const id = Number.parseInt(raw, 10)
  return Number.isFinite(id) ? id : null
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const auth = requirePermission(PERMISSIONS.TENANTS.VIEW)
  if (!auth.ok) return auth.response

  const tenantId = toId(params.id)
  if (!tenantId) return jsonError(400, "BAD_REQUEST", "Invalid tenant id")

  try {
    const rows = await prisma.audit_logs.findMany({
      where: { tenant_id: tenantId },
      orderBy: { created_at: "desc" },
      take: 50,
      select: {
        id: true,
        actor_type: true,
        action: true,
        entity_type: true,
        entity_id: true,
        created_at: true,
      },
    })

    const out = (rows as any[]).map((r) => ({
      id: String(r.id),
      actorType: String(r.actor_type),
      action: String(r.action),
      entityType: String(r.entity_type),
      entityId: String(r.entity_id),
      createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
    }))

    return jsonOk(out)
  } catch (err: any) {
    return jsonError(400, "BAD_REQUEST", err?.message ?? "Failed to load tenant activity")
  }
}

