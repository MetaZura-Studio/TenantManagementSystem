import { requirePermission, PERMISSIONS } from "@/app/api/_platform/auth"
import { jsonError, jsonOk } from "@/app/api/_platform/http"
import { prisma } from "@/lib/server/prisma"
import type { Tenant } from "@/features/tenants/types"
import path from "node:path"
import { mkdir, writeFile } from "node:fs/promises"

export const runtime = "nodejs"

function toId(raw: string) {
  const id = Number.parseInt(raw, 10)
  return Number.isFinite(id) ? id : null
}

function toIso(value: any) {
  if (!value) return value
  return value instanceof Date ? value.toISOString() : value
}

function rowToTenant(row: any): Tenant {
  return {
    id: String(row.id),
    tenantCode: row.tenant_code,
    slug: row.slug,
    shopNameEn: row.shop_name_en,
    shopNameAr: row.shop_name_ar ?? "",
    ownerName: row.owner_name,
    ownerEmail: row.owner_email,
    ownerMobile: row.owner_mobile,
    tenantType: row.tenant_type,
    contactPerson: row.contact_person ?? "",
    address: row.address ?? "",
    city: row.city ?? "",
    zipCode: row.zip_code ?? "",
    country: row.country ?? "",
    invoicePrefix: row.invoice_prefix ?? undefined,
    logoUrl: row.logo_url ?? undefined,
    timezone: "UTC",
    subscriptionStatus: row.subscription_status,
    subscriptionStartDate: toIso(row.subscription_start_date) ?? undefined,
    subscriptionEndDate: toIso(row.subscription_end_date) ?? undefined,
    lockedAt: toIso(row.locked_at) ?? undefined,
    suspensionReason: row.suspension_reason ?? undefined,
    deletedAt: toIso(row.deleted_at) ?? undefined,
    createdAt: toIso(row.created_at),
    createdBy: row.created_by != null ? String(row.created_by) : undefined,
    updatedAt: toIso(row.updated_at),
    updatedBy: row.updated_by != null ? String(row.updated_by) : undefined,
  }
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const auth = requirePermission(PERMISSIONS.TENANTS.VIEW)
  if (!auth.ok) return auth.response

  const id = toId(params.id)
  if (!id) return jsonError(400, "BAD_REQUEST", "Invalid id")

  try {
    const row = await prisma.tenants.findFirst({
      where: { id, deleted_at: null },
    })
    if (!row) return jsonError(404, "NOT_FOUND", "Tenant not found")
    return jsonOk(rowToTenant(row))
  } catch (err: any) {
    return jsonError(400, "BAD_REQUEST", err?.message ?? "Failed to load tenant")
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const auth = requirePermission(PERMISSIONS.TENANTS.UPDATE)
  if (!auth.ok) return auth.response

  const id = toId(params.id)
  if (!id) return jsonError(400, "BAD_REQUEST", "Invalid id")

  const contentType = req.headers.get("content-type") ?? ""
  let updates: Partial<Tenant> & { invoicePrefix?: string }
  let logoFile: File | null = null

  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData()
      const obj: Record<string, any> = {}

      for (const [key, value] of form.entries()) {
        if (key === "logo") {
          if (value instanceof File && value.size > 0) logoFile = value
          continue
        }
        if (typeof value === "string") obj[key] = value
      }

      updates = obj as Partial<Tenant>
    } else {
      updates = (await req.json()) as Partial<Tenant>
    }
  } catch {
    return jsonError(400, "BAD_REQUEST", "Invalid request body")
  }

  try {
    const now = new Date()

    const normalizeDateTime = (value: unknown) => {
      if (value == null) return null
      const s = String(value).trim()
      return s.length === 0 ? null : s
    }

    let row = await prisma.tenants.update({
      where: { id },
      data: {
        tenant_code: updates.tenantCode ?? undefined,
        slug: updates.slug ?? undefined,
        shop_name_en: updates.shopNameEn ?? undefined,
        shop_name_ar: updates.shopNameAr ?? undefined,
        owner_name: updates.ownerName ?? undefined,
        owner_email: updates.ownerEmail ?? undefined,
        owner_mobile: updates.ownerMobile ?? undefined,
        tenant_type: updates.tenantType ?? undefined,
        contact_person: updates.contactPerson ?? undefined,
        address: updates.address ?? undefined,
        city: updates.city ?? undefined,
        zip_code: updates.zipCode ?? undefined,
        country: updates.country ?? undefined,
        invoice_prefix: (updates as any).invoicePrefix ?? undefined,
        subscription_status: updates.subscriptionStatus ?? undefined,
        subscription_start_date: normalizeDateTime(updates.subscriptionStartDate) as any,
        subscription_end_date: normalizeDateTime(updates.subscriptionEndDate) as any,
        locked_at: normalizeDateTime((updates as any).lockedAt) as any,
        suspension_reason: (updates as any).suspensionReason ?? undefined,
        updated_at: now,
        updated_by: null,
      } as any,
    })

    // If a logo was provided via multipart, save it and persist `logo_url`.
    if (logoFile) {
      try {
        const MAX_LOGO_BYTES = 2 * 1024 * 1024 // 2MB
        if (logoFile.size > MAX_LOGO_BYTES) {
          return jsonError(400, "BAD_REQUEST", "Tenant logo is too large (max 2MB)")
        }

        const ext = path.extname(logoFile.name).toLowerCase()
        const safeExt = ext && ext.length <= 6 ? ext : ".png"
        const safeCode = String(updates.tenantCode ?? id).replace(/[^a-z0-9_-]/gi, "") || String(id)
        const random = Math.random().toString(16).slice(2)
        const fileName = `${safeCode}-${Date.now()}-${random}${safeExt}`

        const uploadDir = path.join(process.cwd(), "public", "uploads", "tenant-logos")
        await mkdir(uploadDir, { recursive: true })

        const bytes = Buffer.from(await logoFile.arrayBuffer())
        await writeFile(path.join(uploadDir, fileName), bytes)

        const logoUrl = `/uploads/tenant-logos/${fileName}`
        row = await prisma.tenants.update({
          where: { id },
          data: { logo_url: logoUrl } as any,
        })
      } catch {
        // If saving logo fails, still return updated tenant info.
      }
    }

    return jsonOk(rowToTenant(row))
  } catch (err: any) {
    const message =
      err?.code === "P2002" || err?.code === "ER_DUP_ENTRY"
        ? "Duplicate tenant code/slug/email"
        : err?.message ?? "Failed to update tenant"
    return jsonError(400, "BAD_REQUEST", message)
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const auth = requirePermission(PERMISSIONS.TENANTS.DELETE)
  if (!auth.ok) return auth.response

  const id = toId(params.id)
  if (!id) return jsonError(400, "BAD_REQUEST", "Invalid id")

  try {
    const existing = await prisma.tenants.findFirst({ where: { id, deleted_at: null } })
    if (!existing) return jsonError(404, "NOT_FOUND", "Tenant not found")
    await prisma.tenants.update({
      where: { id },
      data: { deleted_at: new Date(), updated_at: new Date() } as any,
    })
    return jsonOk({ ok: true })
  } catch (err: any) {
    return jsonError(400, "BAD_REQUEST", err?.message ?? "Failed to delete tenant")
  }
}

