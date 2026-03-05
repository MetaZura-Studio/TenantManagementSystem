import { z } from "zod"

export const invoiceSchema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  subscriptionId: z.string().min(1, "Subscription is required"),
  periodStart: z.string().min(1, "Period start is required"),
  periodEnd: z.string().min(1, "Period end is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  currency: z.string().min(1, "Currency is required"),
  notes: z.string().optional(),
})

export const invoiceLineSchema = z.object({
  lineType: z.enum(["SUBSCRIPTION", "TAX", "DISCOUNT", "OTHER"]),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(0, "Quantity must be non-negative"),
  unitPrice: z.number().min(0, "Unit price must be non-negative"),
  sortOrder: z.number().min(0),
})
