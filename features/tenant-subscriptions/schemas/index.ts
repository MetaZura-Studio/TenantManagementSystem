import { z } from "zod"

export const subscriptionSchema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  planId: z.string().min(1, "Plan is required"),
  status: z.enum(["Active", "Expired", "Pending", "TRIALING", "PAST_DUE", "CANCELED"]),
  startDate: z.string().min(1, "Start date is required"),
  currentPeriodStart: z.string().min(1, "Current period start is required"),
  currentPeriodEnd: z.string().min(1, "Current period end is required"),
  canceledAt: z.string().optional(),
  trialStart: z.string().optional(),
  trialEnd: z.string().optional(),
  billingCurrency: z.string().min(1, "Billing currency is required"),
  unitPrice: z.number().min(0, "Unit price must be non-negative"),
  discountAmount: z.number().min(0, "Discount amount must be non-negative"),
  discountPercent: z.number().min(0).max(100, "Discount percent must be between 0 and 100"),
  autoRenew: z.boolean(),
  cancelAtPeriodEnd: z.boolean(),
  notes: z.string().optional(),
})
