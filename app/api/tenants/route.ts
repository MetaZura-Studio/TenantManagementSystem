import { requirePermission, PERMISSIONS } from "@/app/api/_platform/auth"
import { jsonError, jsonOk } from "@/app/api/_platform/http"
import { prisma } from "@/lib/server/prisma"
import type { Tenant } from "@/features/tenants/types"
import path from "node:path"
import { mkdir, writeFile } from "node:fs/promises"

export const runtime = "nodejs"

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

export async function GET() {
  const auth = requirePermission(PERMISSIONS.TENANTS.VIEW)
  if (!auth.ok) return auth.response

  try {
    const rows = await prisma.tenants.findMany({
      where: { deleted_at: null },
      orderBy: { id: "desc" },
    })
    return jsonOk(rows.map(rowToTenant))
  } catch (err: any) {
    return jsonError(400, "BAD_REQUEST", err?.message ?? "Failed to load tenants")
  }
}

export async function POST(req: Request) {
  const auth = requirePermission(PERMISSIONS.TENANTS.CREATE)
  if (!auth.ok) return auth.response

  const contentType = req.headers.get("content-type") ?? ""
  let body: Partial<Tenant> & { invoicePrefix?: string }
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
      body = obj as Partial<Tenant>
    } else {
      body = (await req.json()) as Partial<Tenant>
    }
  } catch {
    return jsonError(400, "BAD_REQUEST", "Invalid request body")
  }

  if (!body?.tenantCode || !body?.slug || !body?.shopNameEn || !body?.ownerName || !body?.ownerEmail) {
    return jsonError(400, "BAD_REQUEST", "Missing required tenant fields")
  }

  try {
    const now = new Date()

    const parseDateOrNull = (value: unknown) => {
      if (value == null) return null
      const s = String(value).trim()
      if (!s) return null
      const d = new Date(s)
      return Number.isNaN(d.getTime()) ? null : d
    }

    const created = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenants.create({
        data: {
          tenant_code: body.tenantCode,
          slug: body.slug,
          shop_name_en: body.shopNameEn,
          shop_name_ar: body.shopNameAr ?? null,
          owner_name: body.ownerName,
          owner_email: body.ownerEmail,
          owner_mobile: body.ownerMobile ?? "",
          tenant_type: body.tenantType ?? "Individual",
          contact_person: body.contactPerson ?? null,
          address: body.address ?? null,
          city: body.city ?? null,
          zip_code: body.zipCode ?? null,
          country: body.country ?? null,
          invoice_prefix: body.invoicePrefix ?? null,
          status: "Active",
          subscription_status: body.subscriptionStatus ?? "TRIAL",
          subscription_start_date: parseDateOrNull(body.subscriptionStartDate) as any,
          subscription_end_date: parseDateOrNull(body.subscriptionEndDate) as any,
          locked_at: parseDateOrNull(body.lockedAt) as any,
          suspension_reason: body.suspensionReason ?? null,
          created_at: now,
          created_by: null,
          updated_at: now,
          updated_by: null,
          deleted_at: null,
          remarks: null,
          state: null,
          logo_url: null,
        } as any,
      })

      // Create a default "Main Branch" for every tenant.
      // If it already exists (unique tenant_id+branch_code), ignore.
      try {
        await tx.branches.create({
          data: {
            tenant_id: tenant.id,
            branch_code: "MAIN",
            name_en: "Main Branch",
            name_ar: null,
            address: body.address ?? null,
            city: body.city ?? null,
            state: null,
            zip_code: body.zipCode ?? null,
            country: body.country ?? null,
            phone: body.ownerMobile ?? null,
            email: null,
            contact_name: body.contactPerson ?? body.ownerName ?? null,
            remarks: null,
            status: "ACTIVE",
            created_at: now,
            created_by: null,
            updated_at: now,
            updated_by: null,
          } as any,
        })
      } catch (err: any) {
        if (err?.code !== "P2002") throw err
      }

      return tenant
    })

    // Optional logo upload. Saved to `public/uploads/tenant-logos` and persisted as `logo_url`.
    if (logoFile) {
      try {
        const MAX_LOGO_BYTES = 2 * 1024 * 1024 // 2MB
        if (logoFile.size > MAX_LOGO_BYTES) {
          return jsonError(400, "BAD_REQUEST", "Tenant logo is too large (max 2MB)")
        }

        const ext = path.extname(logoFile.name).toLowerCase()
        const safeExt = ext && ext.length <= 6 ? ext : ".png"
        const safeCode = String(body.tenantCode).replace(/[^a-z0-9_-]/gi, "")
        const random = Math.random().toString(16).slice(2)
        const fileName = `${safeCode}-${Date.now()}-${random}${safeExt}`
        const uploadDir = path.join(process.cwd(), "public", "uploads", "tenant-logos")
        await mkdir(uploadDir, { recursive: true })

        const bytes = Buffer.from(await logoFile.arrayBuffer())
        await writeFile(path.join(uploadDir, fileName), bytes)
        const logoUrl = `/uploads/tenant-logos/${fileName}`

        const updated = await prisma.tenants.update({
          where: { id: created.id },
          data: { logo_url: logoUrl },
        })

        return jsonOk(rowToTenant(updated), { status: 201 })
      } catch {
        // Don't block tenant creation if logo saving fails.
        // Client can retry upload later via tenant update (if implemented).
        return jsonOk(rowToTenant(created), { status: 201 })
      }
    }

    return jsonOk(rowToTenant(created), { status: 201 })
  } catch (err: any) {
    const message =
      err?.code === "P2002" || err?.code === "ER_DUP_ENTRY"
        ? "Duplicate tenant code/slug/email"
        : err?.message ?? "Failed to create tenant"
    return jsonError(400, "BAD_REQUEST", message)
  }
}

