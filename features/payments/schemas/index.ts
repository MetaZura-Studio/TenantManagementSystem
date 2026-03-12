import { z } from "zod"

export const paymentSchema = z.object({
  paymentCode: z.string().min(1, "Payment code is required"),
  paymentReference: z.string().min(1, "Payment reference is required"),
  tenantId: z.string().min(1, "Tenant is required"),
  invoiceId: z.string().min(1, "Invoice is required"),
  branchId: z.string().optional(),
  subscriptionId: z.string().optional(),
  amount: z.number().min(0, "Amount must be non-negative"),
  paymentMethod: z.enum(["Credit Card", "Bank Transfer", "Cash", "Other"]),
  status: z.enum(["PENDING", "SUCCESS", "FAILED", "REFUNDED"]),
  transactionDate: z.string().min(1, "Transaction date is required"),
  paymentGatewayRef: z.string().optional(),
  failureReason: z.string().optional(),
  billingName: z.string().optional(),
  billingEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  billingAddress: z.string().optional(),
})
