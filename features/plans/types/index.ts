export type BillingCycle = "Monthly" | "Yearly"
export type PlanStatus = "Active" | "Inactive"

export interface Plan {
  id: string
  planCode: string
  planName: string
  description?: string
  amount: number
  billingCycle: BillingCycle
  currency: string
  price: number
  setupFee: number
  trialDays: number
  gracePeriodDays: number
  status: PlanStatus
  displayOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}
