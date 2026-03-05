export type InvoiceStatus = "Paid" | "Pending" | "Overdue" | "PAID" | "PARTIALLY_PAID" | "ISSUED"
export type LineType = "SUBSCRIPTION" | "TAX" | "DISCOUNT" | "OTHER"

export interface Invoice {
  id: string
  invoiceId: string
  invoiceNumber: string
  tenantId: string
  subscriptionId: string
  periodStart: string
  periodEnd: string
  issueDate: string
  dueDate: string
  currency: string
  subtotal: number
  discount: number
  tax: number
  total: number
  amountPaid: number
  amountDue: number
  status: InvoiceStatus
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface InvoiceLine {
  id: string
  lineId: string
  invoiceId: string
  lineType: LineType
  description: string
  quantity: number
  unitPrice: number
  lineAmount: number
  sortOrder: number
  createdAt: string
  updatedAt: string
}
