import { requirePermission, PERMISSIONS } from "@/app/api/_platform/auth"
import { jsonError, jsonOk } from "@/app/api/_platform/http"
import { prisma } from "@/lib/server/prisma"
import type { Branch } from "@/features/branches/types"

export const runtime = "nodejs"

function toId(raw: string) {
  const id = Number.parseInt(raw, 10)
  return Number.isFinite(id) ? id : null
}

function toIso(value: any) {
  if (!value) return value
  return value instanceof Date ? value.toISOString() : value
}

function rowToBranch(row: any): Branch {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    branchCode: row.branch_code,
    nameEn: row.name_en,
    nameAr: row.name_ar ?? "",
    address: row.address ?? "",
    city: row.city ?? "",
    state: row.state ?? "",
    zipCode: row.zip_code ?? "",
    country: row.country ?? "",
    phone: row.phone ?? "",
    contactName: row.contact_name ?? "",
    status: row.status,
    remarks: row.remarks ?? undefined,
    createdAt: toIso(row.created_at),
    createdBy: row.created_by != null ? String(row.created_by) : undefined,
    updatedAt: toIso(row.updated_at),
    updatedBy: row.updated_by != null ? String(row.updated_by) : undefined,
  }
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const auth = requirePermission(PERMISSIONS.BRANCHES.VIEW)
  if (!auth.ok) return auth.response

  const id = toId(params.id)
  if (!id) return jsonError(400, "BAD_REQUEST", "Invalid id")

  try {
    const row = await prisma.branches.findUnique({ where: { id } })
    if (!row) return jsonError(404, "NOT_FOUND", "Branch not found")
    return jsonOk(rowToBranch(row))
  } catch (err: any) {
    return jsonError(400, "BAD_REQUEST", err?.message ?? "Failed to load branch")
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const auth = requirePermission(PERMISSIONS.BRANCHES.UPDATE)
  if (!auth.ok) return auth.response

  const id = toId(params.id)
  if (!id) return jsonError(400, "BAD_REQUEST", "Invalid id")

  let updates: Partial<Branch>
  try {
    updates = (await req.json()) as Partial<Branch>
  } catch {
    return jsonError(400, "BAD_REQUEST", "Invalid JSON body")
  }

  const tenantId =
    updates.tenantId != null ? Number.parseInt(String(updates.tenantId), 10) : null
  if (updates.tenantId != null && !Number.isFinite(tenantId as any)) {
    return jsonError(400, "BAD_REQUEST", "Invalid tenantId")
  }

  try {
    const now = new Date()

    const row = await prisma.branches.update({
      where: { id },
      data: {
        tenant_id: tenantId ?? undefined,
        branch_code: updates.branchCode ?? undefined,
        name_en: updates.nameEn ?? undefined,
        name_ar: updates.nameAr ?? undefined,
        address: updates.address ?? undefined,
        city: updates.city ?? undefined,
        state: updates.state ?? undefined,
        zip_code: updates.zipCode ?? undefined,
        country: updates.country ?? undefined,
        phone: updates.phone ?? undefined,
        contact_name: updates.contactName ?? undefined,
        remarks: updates.remarks ?? undefined,
        status: updates.status ?? undefined,
        updated_at: now,
        updated_by: null,
      } as any,
    })
    if (!row) return jsonError(404, "NOT_FOUND", "Branch not found")
    return jsonOk(rowToBranch(row))
  } catch (err: any) {
    return jsonError(400, "BAD_REQUEST", err?.message ?? "Failed to update branch")
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const auth = requirePermission(PERMISSIONS.BRANCHES.DELETE)
  if (!auth.ok) return auth.response

  const id = toId(params.id)
  if (!id) return jsonError(400, "BAD_REQUEST", "Invalid id")

  try {
    const existing = await prisma.branches.findUnique({ where: { id } })
    if (!existing) return jsonError(404, "NOT_FOUND", "Branch not found")
    await prisma.branches.delete({ where: { id } })
    return jsonOk({ ok: true })
  } catch (err: any) {
    return jsonError(400, "BAD_REQUEST", err?.message ?? "Failed to delete branch")
  }
}

