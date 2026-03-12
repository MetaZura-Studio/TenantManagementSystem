export type BillingCycle = "Monthly" | "Yearly"

export interface Plan {
  id: string
  planCode: string
  nameEn: string
  nameAr: string
  description?: string
  billingCycle: BillingCycle
  currencyCode: string
  monthlyPrice: number
  yearlyPrice: number
  maxBranches: number
  maxUsers: number
  isActive: boolean
  featuresJson?: string
  // System audit fields (read-only, auto-managed)
  createdAt: string
  createdBy?: string
  updatedAt: string
  updatedBy?: string
}
