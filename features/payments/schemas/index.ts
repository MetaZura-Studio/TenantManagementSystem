import { z } from "zod"

export const paymentSchema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  invoiceId: z.string().optional(),
  subscriptionId: z.string().optional(),
  amount: z.number().min(0, "Amount must be non-negative"),
  currency: z.string().min(1, "Currency is required"),
  status: z.enum(["Paid", "Pending", "Failed", "Completed", "PARTIALLY_PAID", "ISSUED"]),
  paymentMethod: z.enum(["Credit Card", "Bank Transfer", "Cash", "Other"]),
  provider: z.string().optional(),
  providerTransactionId: z.string().optional(),
  paidAt: z.string().optional(),
  failureReason: z.string().optional(),
})
