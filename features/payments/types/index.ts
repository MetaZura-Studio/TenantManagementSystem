export type PaymentStatus = "Paid" | "Pending" | "Failed" | "Completed" | "PARTIALLY_PAID" | "ISSUED"
export type PaymentMethod = "Credit Card" | "Bank Transfer" | "Cash" | "Other"

export interface Payment {
  id: string
  paymentId: string
  paymentReference?: string
  tenantId: string
  invoiceId?: string
  subscriptionId?: string
  amount: number
  currency: string
  status: PaymentStatus
  paymentMethod: PaymentMethod
  provider?: string
  providerTransactionId?: string
  paidAt?: string
  failureReason?: string
  createdAt: string
  updatedAt: string
}
