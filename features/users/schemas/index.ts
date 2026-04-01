import { z } from "zod";

// Enum
export const userStatusEnum = z.enum(["ACTIVE", "INACTIVE", "LOCKED"]);

// Base schema (form fields)
export const baseUserSchema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  // Branch is optional: if a tenant has no branches, treat it as the tenant's main branch.
  branchId: z.string().optional(),
  roleId: z.string().min(1, "Role is required"),
  fullNameEn: z.string().min(1, "Full name (English) is required"),
  fullNameAr: z.string().min(1, "Full name (Arabic) is required"),
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  mobile: z.string().min(1, "Mobile is required"),
  // Password is allowed to be an empty string (used by edit form), but if it's non-empty it must be valid.
  password: z
    .union([z.string().min(6, "Password must be at least 6 characters"), z.literal("")])
    .optional(),
  status: userStatusEnum,
  address: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
});

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
