import { z } from "zod"

export const userSchema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  branchId: z.string().min(1, "Branch is required"),
  roleId: z.string().min(1, "Role is required"),
  fullNameEn: z.string().min(1, "Full name (English) is required"),
  fullNameAr: z.string().min(1, "Full name (Arabic) is required"),
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  mobile: z.string().min(1, "Mobile is required"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "LOCKED"]),
  address: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
})
