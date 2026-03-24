export type SubscriptionStatus =
  | "TRIAL"
  | "ACTIVE"
  | "SUSPENDED"
  | "CANCELLED"
  | "EXPIRED"

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

export interface CreateTenantSubscriptionPayload {
  tenantId: string
  planId: string
  status: SubscriptionStatus
  startDate: string
  endDate?: string
  currentPeriodStart?: string
  currentPeriodEnd?: string
  billingCurrencyCode: string
  unitPrice: number
  autoRenew: boolean
  overrideNotes?: string
  notes?: string
}

export interface UpdateTenantSubscriptionPayload {
  id: string
  tenantId?: string
  planId?: string
  status?: SubscriptionStatus
  startDate?: string
  endDate?: string
  currentPeriodStart?: string
  currentPeriodEnd?: string
  lockedAt?: string
  cancelledAt?: string
  billingCurrencyCode?: string
  unitPrice?: number
  autoRenew?: boolean
  overrideNotes?: string
  notes?: string
}

export interface TenantSubscriptionListFilters {
  search?: string
  status?: SubscriptionStatus | "ALL"
  autoRenew?: "ALL" | "YES" | "NO"
  tenantId?: string
  planId?: string
}

export interface TenantSubscriptionStats {
  total: number
  active: number
  trial: number
  suspended: number
  cancelled: number
  expired: number
}