export type SubscriptionStatus =
  | "TRIAL"
  | "ACTIVE"
  | "SUSPENDED"
  | "CANCELLED"
  | "EXPIRED"
  // UI/Frontend statuses
  | "Active"
  | "Pending"
  | "Expired"
  | "TRIALING"
  | "PAST_DUE"
  | "CANCELED"

export interface TenantSubscription {
  id: string
  subscriptionId: string
  tenantId: string
  planId: string
  status: SubscriptionStatus
  startDate: string
  endDate?: string
  currentPeriodStart?: string
  currentPeriodEnd?: string
  lockedAt?: string

  // Calendar / lifecycle
  canceledAt?: string
  trialStart?: string
  trialEnd?: string

  // Billing / pricing
  billingCurrency: string
  unitPrice: number
  discountAmount: number
  discountPercent: number
  autoRenew: boolean
  cancelAtPeriodEnd: boolean

  // Optional notes
  notes?: string

  // Optional legacy fields (kept so older mock data doesn't break too hard)
  overrideNotes?: string
  cancelledAt?: string
  billingCurrencyCode?: string

  // System audit fields (read-only, auto-managed)
  createdAt: string
  createdBy?: string
  updatedAt: string
  updatedBy?: string
}

export interface CreateTenantSubscriptionPayload {
  subscriptionId: string
  tenantId: string
  planId: string
  status: SubscriptionStatus
  startDate: string
  endDate?: string
  currentPeriodStart?: string
  currentPeriodEnd?: string

  billingCurrency: string
  unitPrice: number
  discountAmount: number
  discountPercent: number
  autoRenew: boolean
  cancelAtPeriodEnd: boolean

  canceledAt?: string
  trialStart?: string
  trialEnd?: string

  notes?: string

  // Optional legacy fields
  overrideNotes?: string
}

export interface UpdateTenantSubscriptionPayload {
  id: string
  subscriptionId?: string
  tenantId?: string
  planId?: string
  status?: SubscriptionStatus
  startDate?: string
  endDate?: string
  currentPeriodStart?: string
  currentPeriodEnd?: string
  lockedAt?: string

  canceledAt?: string
  trialStart?: string
  trialEnd?: string

  billingCurrency?: string
  unitPrice?: number
  discountAmount?: number
  discountPercent?: number
  autoRenew?: boolean
  cancelAtPeriodEnd?: boolean

  notes?: string

  // Optional legacy fields
  overrideNotes?: string
  cancelledAt?: string
  billingCurrencyCode?: string
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