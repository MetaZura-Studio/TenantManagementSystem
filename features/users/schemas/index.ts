import { z } from "zod";

// Enum
export const userStatusEnum = z.enum(["ACTIVE", "INACTIVE", "LOCKED"]);

// Base schema (form fields)
export function buildUserSchema(args?: { required?: (field: string) => boolean }) {
  const required = args?.required ?? (() => true)

  const s = (field: string, message: string) =>
    required(field) ? z.string().min(1, message) : z.string().optional().or(z.literal(""))

  const email = (field: string) =>
    required(field)
      ? z.string().min(1, "Email is required").email("Invalid email address")
      : z.string().optional().or(z.literal("")).refine((v) => !v || /.+@.+\..+/.test(v), {
          message: "Invalid email address",
        })

  const status = required("status") ? userStatusEnum : userStatusEnum.or(z.literal("") as any)

  return z.object({
    tenantId: s("tenantId", "Tenant is required"),
    // Branch is optional: if a tenant has no branches, treat it as the tenant's main branch.
    branchId: z.string().optional(),
    roleId: s("roleId", "Role is required"),
    fullNameEn: s("fullNameEn", "Full name (English) is required"),
    fullNameAr: s("fullNameAr", "Full name (Arabic) is required"),
    username: s("username", "Username is required"),
    email: email("email"),
    mobile: s("mobile", "Mobile is required"),
    // Password is allowed to be an empty string (used by edit form), but if it's non-empty it must be valid.
    password: z
      .union([z.string().min(6, "Password must be at least 6 characters"), z.literal("")])
      .optional(),
    status,
    address: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  })
}

export const baseUserSchema = buildUserSchema()

// Schema used directly by the user create/edit forms.
export const userSchema = baseUserSchema;

// CREATE schema
export const createUserSchema = baseUserSchema.extend({
  password: z.string().min(6, "Password is required"),
});

// UPDATE schema
export const updateUserSchema = baseUserSchema.partial().extend({
  id: z.string().min(1, "User ID is required"),
});

// FILTER schema
export const userFilterSchema = z.object({
  search: z.string().optional(),
  status: userStatusEnum.or(z.literal("ALL")).optional(),
  tenantId: z.string().optional(),
  branchId: z.string().optional(),
  roleId: z.string().optional(),
});

// TYPES (inferred)
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserFilterInput = z.infer<typeof userFilterSchema>;
