// Global types that are shared across multiple modules
export const MODULES = [
  "Dashboard",
  "Tenant Management",
  "Plans & Subscriptions",
  "Users",
  "Roles",
  "Invoice Management",
  "Payments",
  "Currency Lookup",
  "Settings",
] as const

export const PERMISSION_ACTIONS = ["view", "create", "edit", "delete"] as const

// Re-export commonly used types for convenience
export type { TenantStatus, SubscriptionStatus } from "@/features/tenants/types"
export type { UserStatus } from "@/features/users/types"
export type { PaymentStatus, PaymentMethod } from "@/features/payments/types"
export type { InvoiceStatus, LineType } from "@/features/invoices/types"
export type { PlanStatus, BillingCycle } from "@/features/plans/types"
export type { Permission } from "@/features/roles/types"
