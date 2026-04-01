import { requirePermission, PERMISSIONS } from "@/app/api/_platform/auth"
import { jsonError, jsonOk } from "@/app/api/_platform/http"
import { prisma } from "@/lib/server/prisma"
import type { Branch } from "@/features/branches/types"

export const runtime = "nodejs"

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

export async function GET() {
  const auth = requirePermission(PERMISSIONS.BRANCHES.VIEW)
  if (!auth.ok) return auth.response

  try {
    const rows = await prisma.branches.findMany({ orderBy: { id: "desc" } })
    return jsonOk(rows.map(rowToBranch))
  } catch (err: any) {
    return jsonError(400, "BAD_REQUEST", err?.message ?? "Failed to load branches")
  }
}

export async function POST(req: Request) {
  const auth = requirePermission(PERMISSIONS.BRANCHES.CREATE)
  if (!auth.ok) return auth.response

  let body: Partial<Branch>
  try {
    body = (await req.json()) as Partial<Branch>
  } catch {
    return jsonError(400, "BAD_REQUEST", "Invalid JSON body")
  }

  const tenantId = Number.parseInt(String(body.tenantId ?? ""), 10)
  if (!Number.isFinite(tenantId)) return jsonError(400, "BAD_REQUEST", "Invalid tenantId")

  if (!body?.branchCode || !body?.nameEn) {
    return jsonError(400, "BAD_REQUEST", "Missing required branch fields")
  }

  try {
    const now = new Date()

    const created = await prisma.branches.create({
      data: {
        tenant_id: tenantId,
        branch_code: body.branchCode,
        name_en: body.nameEn,
        name_ar: body.nameAr ?? null,
        address: body.address ?? null,
        city: body.city ?? null,
        state: body.state ?? null,
        zip_code: body.zipCode ?? null,
        country: body.country ?? null,
        phone: body.phone ?? null,
        email: null,
        contact_name: body.contactName ?? null,
        remarks: body.remarks ?? null,
        status: body.status ?? "ACTIVE",
        created_at: now,
        created_by: null,
        updated_at: now,
        updated_by: null,
      } as any,
    })
    return jsonOk(rowToBranch(created), { status: 201 })
  } catch (err: any) {
    return jsonError(400, "BAD_REQUEST", err?.message ?? "Failed to create branch")
  }
}

