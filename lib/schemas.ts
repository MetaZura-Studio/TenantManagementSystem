import { z } from "zod"
import {
  TenantStatus,
  SubscriptionStatus,
  UserStatus,
  PaymentStatus,
  InvoiceStatus,
  PlanStatus,
  BillingCycle,
  OwnerType,
  PaymentMethod,
  LineType,
} from "./types"

export const tenantSchema = z.object({
  tenantName: z.string().min(1, "Tenant name is required"),
  contactPerson: z.string().min(1, "Contact person is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  status: z.enum(["Active", "Inactive"]),
  ownerName: z.string().min(1, "Owner name is required"),
  ownerEmail: z.string().email("Invalid email address"),
  ownerPhone: z.string().min(1, "Owner phone is required"),
  ownerType: z.enum(["Indv", "Company"]),
  remarks: z.string().optional(),
})

export const branchSchema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  branchName: z.string().min(1, "Branch name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  contactPerson: z.string().optional(),
  addressLine1: z.string().min(1, "Address line 1 is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  stateProvince: z.string().min(1, "State/Province is required"),
  zipPostalCode: z.string().min(1, "Zip/Postal code is required"),
  branchStatus: z.enum(["Active", "Inactive"]),
  remarks: z.string().optional(),
})

export const planSchema = z.object({
  planCode: z.string().min(1, "Plan code is required"),
  planName: z.string().min(1, "Plan name is required"),
  description: z.string().optional(),
  billingCycle: z.enum(["Monthly", "Yearly"]),
  currency: z.string().min(1, "Currency is required"),
  price: z.number().min(0, "Price must be non-negative"),
  setupFee: z.number().min(0, "Setup fee must be non-negative"),
  trialDays: z.number().min(0, "Trial days must be non-negative"),
  gracePeriodDays: z.number().min(0, "Grace period days must be non-negative"),
  displayOrder: z.number().min(0),
  isActive: z.boolean(),
})

export const subscriptionSchema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  planId: z.string().min(1, "Plan is required"),
  status: z.enum(["Active", "Expired", "Pending", "TRIALING", "PAST_DUE", "CANCELED"]),
  startDate: z.string().min(1, "Start date is required"),
  currentPeriodStart: z.string().min(1, "Current period start is required"),
  currentPeriodEnd: z.string().min(1, "Current period end is required"),
  canceledAt: z.string().optional(),
  trialStart: z.string().optional(),
  trialEnd: z.string().optional(),
  billingCurrency: z.string().min(1, "Billing currency is required"),
  unitPrice: z.number().min(0, "Unit price must be non-negative"),
  discountAmount: z.number().min(0, "Discount amount must be non-negative"),
  discountPercent: z.number().min(0).max(100, "Discount percent must be between 0 and 100"),
  autoRenew: z.boolean(),
  cancelAtPeriodEnd: z.boolean(),
  notes: z.string().optional(),
})

export const userSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  email: z.string().email("Invalid email address"),
  mobile: z.string().min(1, "Mobile is required"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  tenantId: z.string().min(1, "Tenant is required"),
  branchId: z.string().optional(),
  roleId: z.string().min(1, "Role is required"),
  status: z.enum(["Active", "Inactive"]),
})

export const roleSchema = z.object({
  roleName: z.string().min(1, "Role name is required"),
  description: z.string().optional(),
  status: z.enum(["Active", "Inactive"]),
  permissions: z.array(
    z.object({
      module: z.string(),
      view: z.boolean(),
      create: z.boolean(),
      edit: z.boolean(),
      delete: z.boolean(),
    })
  ),
})

export const invoiceSchema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  subscriptionId: z.string().min(1, "Subscription is required"),
  periodStart: z.string().min(1, "Period start is required"),
  periodEnd: z.string().min(1, "Period end is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  currency: z.string().min(1, "Currency is required"),
  notes: z.string().optional(),
})

export const invoiceLineSchema = z.object({
  lineType: z.enum(["SUBSCRIPTION", "TAX", "DISCOUNT", "OTHER"]),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(0, "Quantity must be non-negative"),
  unitPrice: z.number().min(0, "Unit price must be non-negative"),
  sortOrder: z.number().min(0),
})

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

export const currencyRateSchema = z.object({
  currencyCode: z.string().min(1, "Currency code is required"),
  currencyName: z.string().min(1, "Currency name is required"),
  exchangeRate: z.number().min(0, "Exchange rate must be non-negative"),
})
