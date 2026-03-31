import { z } from "zod";

// Enum
export const roleStatusEnum = z.enum(["Active", "Inactive"]);

// Permission schema
export const permissionSchema = z.object({
  module: z.string(),
  view: z.boolean(),
  create: z.boolean(),
  edit: z.boolean(),
  delete: z.boolean(),
  print: z.boolean(),
});

// Base schema
export const baseRoleSchema = z.object({
  roleName: z.string().min(1, "Role name is required"),
  description: z.string().optional(),
  status: roleStatusEnum,
  permissions: z.array(permissionSchema),
});

// Schema used directly by the role create/edit forms
export const roleSchema = baseRoleSchema;

// CREATE schema
export const createRoleSchema = baseRoleSchema;

// UPDATE schema
export const updateRoleSchema = baseRoleSchema.partial().extend({
  id: z.string().min(1, "Role ID is required"),
});

// FILTER schema
export const roleFilterSchema = z.object({
  search: z.string().optional(),
  status: roleStatusEnum.or(z.literal("ALL")).optional(),
});

// Types (inferred)
export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type RoleFilterInput = z.infer<typeof roleFilterSchema>;
