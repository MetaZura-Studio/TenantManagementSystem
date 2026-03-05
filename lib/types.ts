export type TenantStatus = "Active" | "Inactive"
export type SubscriptionStatus = "Active" | "Expired" | "Pending" | "TRIALING" | "PAST_DUE" | "CANCELED"
export type UserStatus = "Active" | "Inactive"
export type PaymentStatus = "Paid" | "Pending" | "Failed" | "Completed" | "PARTIALLY_PAID" | "ISSUED"
export type InvoiceStatus = "Paid" | "Pending" | "Overdue" | "PAID" | "PARTIALLY_PAID" | "ISSUED"
export type PlanStatus = "Active" | "Inactive"
export type BillingCycle = "Monthly" | "Yearly"
export type OwnerType = "Indv" | "Company"
export type PaymentMethod = "Credit Card" | "Bank Transfer" | "Cash" | "Other"
export type LineType = "SUBSCRIPTION" | "TAX" | "DISCOUNT" | "OTHER"

export interface Tenant {
  id: string
  tenantId: string
  tenantName: string
  contactPerson: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  status: TenantStatus
  subscriptionStatus: SubscriptionStatus
  ownerName: string
  ownerEmail: string
  ownerPhone: string
  ownerType: OwnerType
  remarks?: string
  createdAt: string
  updatedAt: string
}

export interface Branch {
  id: string
  tenantId: string
  branchName: string
  phoneNumber: string
  email?: string
  contactPerson?: string
  addressLine1: string
  addressLine2?: string
  city: string
  stateProvince: string
  zipPostalCode: string
  branchStatus: "Active" | "Inactive"
  remarks?: string
  createdAt: string
  updatedAt: string
}

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

export interface TenantSubscription {
  id: string
  subscriptionId: string
  tenantId: string
  planId: string
  status: SubscriptionStatus
  startDate: string
  currentPeriodStart: string
  currentPeriodEnd: string
  canceledAt?: string
  trialStart?: string
  trialEnd?: string
  billingCurrency: string
  unitPrice: number
  discountAmount: number
  discountPercent: number
  autoRenew: boolean
  cancelAtPeriodEnd: boolean
  notes?: string
  changeReason?: string
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  userId: string
  username: string
  email: string
  mobile: string
  firstName?: string
  lastName?: string
  phone?: string
  address?: string
  tenantId: string
  branchId?: string
  roleId: string
  status: UserStatus
  createdAt: string
  updatedAt: string
}

export interface Role {
  id: string
  roleName: string
  description?: string
  status: "Active" | "Inactive"
  permissions: Permission[]
  createdAt: string
  updatedAt: string
}

export interface Permission {
  module: string
  view: boolean
  create: boolean
  edit: boolean
  delete: boolean
}

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

export interface CurrencyRate {
  id: string
  currencyCode: string
  currencyName: string
  exchangeRate: number
  lastUpdated: string
}

export interface Settings {
  id: string
  key: string
  value: string
  category: string
  updatedAt: string
}

export const MODULES = [
  "Dashboard",
  "Tenant Management",
  "Plans & Subscriptions",
  "Users",
  "Roles",
  "Invoice Management",
  "Payments",
  "Currency Lookup",
  "Settings",
] as const

export const PERMISSION_ACTIONS = ["view", "create", "edit", "delete"] as const
