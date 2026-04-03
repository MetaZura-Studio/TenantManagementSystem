export type TenantStatus = "Active" | "Inactive"
export type SubscriptionStatus = "TRIAL" | "ACTIVE" | "SUSPENDED" | "CANCELLED" | "EXPIRED"
export type TenantType = "Individual" | "Company"

export interface Tenant {
  id: string
  tenantCode: string
  slug: string
  shopNameEn: string
  shopNameAr: string
  ownerName: string
  ownerEmail: string
  ownerMobile: string
  tenantType: TenantType
  contactPerson: string
  address: string
  city: string
  zipCode: string
  country: string
  timezone: string
  invoicePrefix?: string
  logoUrl?: string
  subscriptionStatus: SubscriptionStatus
  subscriptionStartDate?: string
  subscriptionEndDate?: string
  lockedAt?: string
  suspensionReason?: string
  deletedAt?: string
  // System audit fields (read-only, auto-managed)
  createdAt: string
  createdBy?: string
  updatedAt: string
  updatedBy?: string
}
