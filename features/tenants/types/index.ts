export type TenantStatus = "Active" | "Inactive"
export type SubscriptionStatus = "Active" | "Expired" | "Pending" | "TRIALING" | "PAST_DUE" | "CANCELED"
export type OwnerType = "Indv" | "Company"

export interface Tenant {
  id: string
  tenantId: string
  tenantName: string
  contactPerson: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  status: TenantStatus
  subscriptionStatus: SubscriptionStatus
  ownerName: string
  ownerEmail: string
  ownerPhone: string
  ownerType: OwnerType
  remarks?: string
  createdAt: string
  updatedAt: string
}
