import { z } from "zod"

export const subscriptionStatusEnum = z.enum([
  "TRIAL",
  "ACTIVE",
  "SUSPENDED",
  "CANCELLED",
  "EXPIRED",
  // UI/Frontend statuses
  "Active",
  "Pending",
  "Expired",
  "TRIALING",
  "PAST_DUE",
  "CANCELED",
])

// Base schema (shared fields)
export const baseSubscriptionSchema = z.object({
  subscriptionId: z.string().min(1, "Subscription ID is required"),
  tenantId: z.string().min(1, "Tenant is required"),
  planId: z.string().min(1, "Plan is required"),
  status: subscriptionStatusEnum,
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  currentPeriodStart: z.string().min(1, "Current period start is required"),
  currentPeriodEnd: z.string().min(1, "Current period end is required"),

  // Billing / pricing
  billingCurrency: z.string().min(1, "Billing currency is required"),
  unitPrice: z.number().min(0, "Unit price must be non-negative"),
  discountAmount: z.number().min(0, "Discount amount must be non-negative"),
  discountPercent: z.number().min(0, "Discount percent must be non-negative"),
  autoRenew: z.boolean(),

  cancelAtPeriodEnd: z.boolean(),
  canceledAt: z.string().optional(),
  trialStart: z.string().optional(),
  trialEnd: z.string().optional(),

  notes: z.string().optional(),
})

// Schema used directly by Create/Edit subscription forms.
// This intentionally excludes `subscriptionId` (system-generated / route identity).
export const subscriptionSchema = baseSubscriptionSchema.omit({
  subscriptionId: true,
})

// CREATE schema
export const createTenantSubscriptionSchema = baseSubscriptionSchema.omit({
  subscriptionId: true, // system generated
})

// UPDATE schema (partial)
export const updateTenantSubscriptionSchema = baseSubscriptionSchema
  .partial()
  .extend({
    id: z.string().min(1, "Subscription internal id is required"),
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
