import { z } from "zod"

export const tenantSchema = z.object({
  tenantCode: z.string().min(1, "Tenant code is required"),
  slug: z.string().min(1, "Slug is required"),
  shopNameEn: z.string().min(1, "Shop name (English) is required"),
  shopNameAr: z.string().min(1, "Shop name (Arabic) is required"),
  ownerName: z.string().min(1, "Owner name is required"),
  ownerEmail: z.string().email("Invalid email address"),
  ownerMobile: z.string().min(1, "Owner mobile is required"),
  tenantType: z.enum(["Individual", "Company"]),
  contactPerson: z.string().min(1, "Contact person is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  country: z.string().min(1, "Country is required"),
  timezone: z.string().min(1, "Timezone is required"),
  subscriptionStatus: z.enum(["TRIAL", "ACTIVE", "SUSPENDED", "CANCELLED", "EXPIRED"]),
  subscriptionStartDate: z.string().optional(),
  subscriptionEndDate: z.string().optional(),
  lockedAt: z.string().optional(),
  suspensionReason: z.string().optional(),
})
