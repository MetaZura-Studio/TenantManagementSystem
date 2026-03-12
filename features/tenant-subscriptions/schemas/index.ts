import { z } from "zod"

export const subscriptionSchema = z.object({
  subscriptionCode: z.string().min(1, "Subscription code is required"),
  tenantId: z.string().min(1, "Tenant is required"),
  planId: z.string().min(1, "Plan is required"),
  status: z.enum(["TRIAL", "ACTIVE", "SUSPENDED", "CANCELLED", "EXPIRED"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  currentPeriodStart: z.string().optional(),
  currentPeriodEnd: z.string().optional(),
  billingCurrencyCode: z.string().min(1, "Billing currency code is required"),
  unitPrice: z.number().min(0, "Unit price must be non-negative"),
  autoRenew: z.boolean(),
  overrideNotes: z.string().optional(),
  notes: z.string().optional(),
})
