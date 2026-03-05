import { z } from "zod"

export const branchSchema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  branchName: z.string().min(1, "Branch name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  contactPerson: z.string().optional(),
  addressLine1: z.string().min(1, "Address line 1 is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  stateProvince: z.string().min(1, "State/Province is required"),
  zipPostalCode: z.string().min(1, "Zip/Postal code is required"),
  branchStatus: z.enum(["Active", "Inactive"]),
  remarks: z.string().optional(),
})
