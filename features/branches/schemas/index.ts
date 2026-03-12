import { z } from "zod"

export const branchSchema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  branchCode: z.string().min(1, "Branch code is required"),
  nameEn: z.string().min(1, "Branch name (English) is required"),
  nameAr: z.string().min(1, "Branch name (Arabic) is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  country: z.string().min(1, "Country is required"),
  phone: z.string().min(1, "Phone is required"),
  contactName: z.string().min(1, "Contact name is required"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  remarks: z.string().optional(),
})
