export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED"
export type PaymentMethod = "Credit Card" | "Bank Transfer" | "Cash" | "Other"

export interface Payment {
  id: string
  paymentCode: string
  paymentReference: string
  tenantId: string
  invoiceId: string
  branchId?: string
  subscriptionId?: string
  amount: number
  paymentMethod: PaymentMethod
  status: PaymentStatus
  transactionDate: string
  paymentGatewayRef?: string
  failureReason?: string
  billingName?: string
  billingEmail?: string
  billingAddress?: string
  // System audit fields (read-only, auto-managed)
  createdAt: string
  createdBy?: string
  updatedAt: string
  updatedBy?: string
}
