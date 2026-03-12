export type InvoiceStatus = "DRAFT" | "ISSUED" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" | "CANCELLED"
export type LineType = "SUBSCRIPTION" | "TAX" | "DISCOUNT" | "OTHER"

export interface Invoice {
  id: string
  invoiceCode: string
  tenantId: string
  subscriptionId: string
  periodStart: string
  periodEnd: string
  issueDate: string
  dueDate: string
  currencyCode: string
  totalAmount: number
  taxAmount: number
  discountAmount: number
  paidAmount: number
  amountDue: number
  status: InvoiceStatus
  notes?: string
  // System audit fields (read-only, auto-managed)
  createdAt: string
  createdBy?: string
  updatedAt: string
  updatedBy?: string
}

export interface InvoiceLine {
  id: string
  invoiceId: string
  lineType: LineType
  description: string
  quantity: number
  unitPrice: number
  sortOrder: number
  // System audit fields (read-only, auto-managed)
  createdAt: string
  createdBy?: string
  updatedAt: string
  updatedBy?: string
}
