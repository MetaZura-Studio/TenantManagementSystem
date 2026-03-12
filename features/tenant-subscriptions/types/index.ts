export type SubscriptionStatus = "TRIAL" | "ACTIVE" | "SUSPENDED" | "CANCELLED" | "EXPIRED"

export interface TenantSubscription {
  id: string
  subscriptionCode: string
  tenantId: string
  planId: string
  status: SubscriptionStatus
  startDate: string
  endDate?: string
  currentPeriodStart?: string
  currentPeriodEnd?: string
  lockedAt?: string
  cancelledAt?: string
  billingCurrencyCode: string
  unitPrice: number
  autoRenew: boolean
  overrideNotes?: string
  notes?: string
  // System audit fields (read-only, auto-managed)
  createdAt: string
  createdBy?: string
  updatedAt: string
  updatedBy?: string
}
