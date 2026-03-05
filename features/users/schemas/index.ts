import { z } from "zod"

export const userSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  email: z.string().email("Invalid email address"),
  mobile: z.string().min(1, "Mobile is required"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  tenantId: z.string().min(1, "Tenant is required"),
  branchId: z.string().optional(),
  roleId: z.string().min(1, "Role is required"),
  status: z.enum(["Active", "Inactive"]),
})
