import { z } from "zod"

export const tenantSchema = z.object({
  tenantName: z.string().min(1, "Tenant name is required"),
  contactPerson: z.string().min(1, "Contact person is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  status: z.enum(["Active", "Inactive"]),
  ownerName: z.string().min(1, "Owner name is required"),
  ownerEmail: z.string().email("Invalid email address"),
  ownerPhone: z.string().min(1, "Owner phone is required"),
  ownerType: z.enum(["Indv", "Company"]),
  remarks: z.string().optional(),
})
