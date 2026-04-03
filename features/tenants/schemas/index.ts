import { z } from "zod"

export function buildTenantSchema(args?: { required?: (field: string) => boolean }) {
  const required = args?.required ?? (() => true)

  const s = (field: string, message: string) =>
    required(field) ? z.string().min(1, message) : z.string().optional().or(z.literal(""))

  const email = (field: string) =>
    required(field)
      ? z.string().min(1, "Owner email is required").email("Invalid email address")
      : z.string().optional().or(z.literal("")).refine((v) => !v || /.+@.+\..+/.test(v), {
          message: "Invalid email address",
        })

  const tenantType = required("tenantType")
    ? z.enum(["Individual", "Company"])
    : z.enum(["Individual", "Company"]).or(z.literal(""))

  const subscriptionStatus = required("subscriptionStatus")
    ? z.enum(["TRIAL", "ACTIVE", "SUSPENDED", "CANCELLED", "EXPIRED"])
    : z.enum(["TRIAL", "ACTIVE", "SUSPENDED", "CANCELLED", "EXPIRED"]).or(z.literal(""))

  return z.object({
    tenantCode: s("tenantCode", "Tenant code is required"),
    slug: z.string().min(1, "Slug is required"),
    shopNameEn: s("shopNameEn", "Shop name (English) is required"),
    shopNameAr: s("shopNameAr", "Shop name (Arabic) is required"),
    ownerName: s("ownerName", "Owner name is required"),
    ownerEmail: email("ownerEmail"),
    ownerMobile: s("ownerMobile", "Owner mobile is required"),
    tenantType,
    invoicePrefix: s("invoicePrefix", "Invoice prefix is required"),
    logo: z.instanceof(File).optional(),
    contactPerson: s("contactPerson", "Contact person is required"),
    address: s("address", "Address is required"),
    city: s("city", "City is required"),
    zipCode: s("zipCode", "Zip code is required"),
    country: s("country", "Country is required"),
    timezone: s("timezone", "Timezone is required"),
    subscriptionStatus,
    subscriptionStartDate: z.string().optional(),
    subscriptionEndDate: z.string().optional(),
    lockedAt: z.string().optional(),
    suspensionReason: z.string().optional(),
  })
}

export const tenantSchema = buildTenantSchema()
