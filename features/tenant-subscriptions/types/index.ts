import type { SubscriptionStatus } from "@/features/tenants/types"

export interface TenantSubscription {
  id: string
  subscriptionId: string
  tenantId: string
  planId: string
  status: SubscriptionStatus
  startDate: string
  currentPeriodStart: string
  currentPeriodEnd: string
  canceledAt?: string
  trialStart?: string
  trialEnd?: string
  billingCurrency: string
  unitPrice: number
  discountAmount: number
  discountPercent: number
  autoRenew: boolean
  cancelAtPeriodEnd: boolean
  notes?: string
  changeReason?: string
  createdAt: string
  updatedAt: string
}
