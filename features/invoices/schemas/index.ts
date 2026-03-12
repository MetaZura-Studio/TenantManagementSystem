import { z } from "zod"

export const invoiceSchema = z.object({
  invoiceCode: z.string().min(1, "Invoice code is required"),
  tenantId: z.string().min(1, "Tenant is required"),
  subscriptionId: z.string().min(1, "Subscription is required"),
  periodStart: z.string().min(1, "Period start is required"),
  periodEnd: z.string().min(1, "Period end is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  currencyCode: z.string().min(1, "Currency code is required"),
  totalAmount: z.number().min(0, "Total amount must be non-negative"),
  taxAmount: z.number().min(0, "Tax amount must be non-negative").default(0),
  discountAmount: z.number().min(0, "Discount amount must be non-negative").default(0),
  paidAmount: z.number().min(0, "Paid amount must be non-negative").default(0),
  amountDue: z.number().min(0, "Amount due must be non-negative"),
  status: z.enum(["DRAFT", "ISSUED", "PARTIALLY_PAID", "PAID", "OVERDUE", "CANCELLED"]),
  notes: z.string().optional(),
})

export const invoiceLineSchema = z.object({
  invoiceId: z.string().min(1, "Invoice ID is required"),
  lineType: z.enum(["SUBSCRIPTION", "TAX", "DISCOUNT", "OTHER"]),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(0, "Quantity must be non-negative"),
  unitPrice: z.number().min(0, "Unit price must be non-negative"),
  sortOrder: z.number().min(0),
})
