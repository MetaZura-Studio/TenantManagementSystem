import { z } from "zod"

export const roleSchema = z.object({
  roleName: z.string().min(1, "Role name is required"),
  description: z.string().optional(),
  status: z.enum(["Active", "Inactive"]),
  permissions: z.array(
    z.object({
      module: z.string(),
      view: z.boolean(),
      create: z.boolean(),
      edit: z.boolean(),
      delete: z.boolean(),
    })
  ),
})
