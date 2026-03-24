import { z } from "zod"

export const subscriptionStatusEnum = z.enum([
  "TRIAL",
  "ACTIVE",
  "SUSPENDED",
  "CANCELLED",
  "EXPIRED",
])

// Base schema (shared fields)
export const baseSubscriptionSchema = z.object({
  subscriptionCode: z.string().min(1, "Subscription code is required"),
  tenantId: z.string().min(1, "Tenant is required"),
  planId: z.string().min(1, "Plan is required"),
  status: subscriptionStatusEnum,
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

// CREATE schema
export const createTenantSubscriptionSchema = baseSubscriptionSchema.omit({
  subscriptionCode: true, // system generated
})

// UPDATE schema (partial)
export const updateTenantSubscriptionSchema = baseSubscriptionSchema
  .partial()
  .extend({
    id: z.string().min(1, "Subscription ID is required"),
  })

// FILTER schema (for list page)
export const tenantSubscriptionFilterSchema = z.object({
  search: z.string().optional(),
  status: subscriptionStatusEnum.or(z.literal("ALL")).optional(),
  autoRenew: z.enum(["ALL", "YES", "NO"]).optional(),
  tenantId: z.string().optional(),
  planId: z.string().optional(),
})

// TYPES (auto inferred)
export type CreateTenantSubscriptionInput = z.infer<
  typeof createTenantSubscriptionSchema
>

export type UpdateTenantSubscriptionInput = z.infer<
  typeof updateTenantSubscriptionSchema
>

export type TenantSubscriptionFilterInput = z.infer<
  typeof tenantSubscriptionFilterSchema
>
