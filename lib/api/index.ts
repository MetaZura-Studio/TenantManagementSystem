import { useStore } from "../store"
import type {
  Tenant,
  Branch,
  Plan,
  TenantSubscription,
  User,
  Role,
  Invoice,
  InvoiceLine,
  Payment,
  CurrencyRate,
} from "../types"

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Tenants API
export const tenantsApi = {
  getAll: async (): Promise<Tenant[]> => {
    await delay(300)
    return useStore.getState().tenants
  },
  getById: async (id: string): Promise<Tenant | undefined> => {
    await delay(200)
    return useStore.getState().tenants.find((t) => t.id === id)
  },
  create: async (tenant: Omit<Tenant, "id" | "createdAt" | "updatedAt">): Promise<Tenant> => {
    await delay(400)
    const newTenant: Tenant = {
      ...tenant,
      id: `tenant-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    useStore.getState().addTenant(newTenant)
    return newTenant
  },
  update: async (id: string, updates: Partial<Tenant>): Promise<Tenant> => {
    await delay(400)
    const tenant = useStore.getState().tenants.find((t) => t.id === id)
    if (!tenant) throw new Error("Tenant not found")
    const updated = { ...tenant, ...updates, updatedAt: new Date().toISOString() }
    useStore.getState().updateTenant(id, updated)
    return updated
  },
  delete: async (id: string): Promise<void> => {
    await delay(300)
    useStore.getState().deleteTenant(id)
  },
}

// Branches API
export const branchesApi = {
  getAll: async (): Promise<Branch[]> => {
    await delay(300)
    return useStore.getState().branches
  },
  getById: async (id: string): Promise<Branch | undefined> => {
    await delay(200)
    return useStore.getState().branches.find((b) => b.id === id)
  },
  create: async (branch: Omit<Branch, "id" | "createdAt" | "updatedAt">): Promise<Branch> => {
    await delay(400)
    const newBranch: Branch = {
      ...branch,
      id: `branch-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    useStore.getState().addBranch(newBranch)
    return newBranch
  },
  update: async (id: string, updates: Partial<Branch>): Promise<Branch> => {
    await delay(400)
    const branch = useStore.getState().branches.find((b) => b.id === id)
    if (!branch) throw new Error("Branch not found")
    const updated = { ...branch, ...updates, updatedAt: new Date().toISOString() }
    useStore.getState().updateBranch(id, updated)
    return updated
  },
  delete: async (id: string): Promise<void> => {
    await delay(300)
    useStore.getState().deleteBranch(id)
  },
}

// Plans API
export const plansApi = {
  getAll: async (): Promise<Plan[]> => {
    await delay(300)
    return useStore.getState().plans
  },
  getById: async (id: string): Promise<Plan | undefined> => {
    await delay(200)
    return useStore.getState().plans.find((p) => p.id === id)
  },
  create: async (plan: Omit<Plan, "id" | "createdAt" | "updatedAt">): Promise<Plan> => {
    await delay(400)
    const newPlan: Plan = {
      ...plan,
      id: `plan-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    useStore.getState().addPlan(newPlan)
    return newPlan
  },
  update: async (id: string, updates: Partial<Plan>): Promise<Plan> => {
    await delay(400)
    const plan = useStore.getState().plans.find((p) => p.id === id)
    if (!plan) throw new Error("Plan not found")
    const updated = { ...plan, ...updates, updatedAt: new Date().toISOString() }
    useStore.getState().updatePlan(id, updated)
    return updated
  },
  delete: async (id: string): Promise<void> => {
    await delay(300)
    useStore.getState().deletePlan(id)
  },
}

// Subscriptions API
export const subscriptionsApi = {
  getAll: async (): Promise<TenantSubscription[]> => {
    await delay(300)
    return useStore.getState().subscriptions
  },
  getById: async (id: string): Promise<TenantSubscription | undefined> => {
    await delay(200)
    return useStore.getState().subscriptions.find((s) => s.id === id)
  },
  create: async (
    subscription: Omit<TenantSubscription, "id" | "createdAt" | "updatedAt">
  ): Promise<TenantSubscription> => {
    await delay(400)
    const newSubscription: TenantSubscription = {
      ...subscription,
      id: `sub-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    useStore.getState().addSubscription(newSubscription)
    return newSubscription
  },
  update: async (
    id: string,
    updates: Partial<TenantSubscription>
  ): Promise<TenantSubscription> => {
    await delay(400)
    const subscription = useStore.getState().subscriptions.find((s) => s.id === id)
    if (!subscription) throw new Error("Subscription not found")
    const updated = { ...subscription, ...updates, updatedAt: new Date().toISOString() }
    useStore.getState().updateSubscription(id, updated)
    return updated
  },
  delete: async (id: string): Promise<void> => {
    await delay(300)
    useStore.getState().deleteSubscription(id)
  },
}

// Users API
export const usersApi = {
  getAll: async (): Promise<User[]> => {
    await delay(300)
    return useStore.getState().users
  },
  getById: async (id: string): Promise<User | undefined> => {
    await delay(200)
    return useStore.getState().users.find((u) => u.id === id)
  },
  create: async (user: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> => {
    await delay(400)
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    useStore.getState().addUser(newUser)
    return newUser
  },
  update: async (id: string, updates: Partial<User>): Promise<User> => {
    await delay(400)
    const user = useStore.getState().users.find((u) => u.id === id)
    if (!user) throw new Error("User not found")
    const updated = { ...user, ...updates, updatedAt: new Date().toISOString() }
    useStore.getState().updateUser(id, updated)
    return updated
  },
  delete: async (id: string): Promise<void> => {
    await delay(300)
    useStore.getState().deleteUser(id)
  },
}

// Roles API
export const rolesApi = {
  getAll: async (): Promise<Role[]> => {
    await delay(300)
    return useStore.getState().roles
  },
  getById: async (id: string): Promise<Role | undefined> => {
    await delay(200)
    return useStore.getState().roles.find((r) => r.id === id)
  },
  create: async (role: Omit<Role, "id" | "createdAt" | "updatedAt">): Promise<Role> => {
    await delay(400)
    const newRole: Role = {
      ...role,
      id: `role-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    useStore.getState().addRole(newRole)
    return newRole
  },
  update: async (id: string, updates: Partial<Role>): Promise<Role> => {
    await delay(400)
    const role = useStore.getState().roles.find((r) => r.id === id)
    if (!role) throw new Error("Role not found")
    const updated = { ...role, ...updates, updatedAt: new Date().toISOString() }
    useStore.getState().updateRole(id, updated)
    return updated
  },
  delete: async (id: string): Promise<void> => {
    await delay(300)
    useStore.getState().deleteRole(id)
  },
}

// Invoices API
export const invoicesApi = {
  getAll: async (): Promise<Invoice[]> => {
    await delay(300)
    return useStore.getState().invoices
  },
  getById: async (id: string): Promise<Invoice | undefined> => {
    await delay(200)
    return useStore.getState().invoices.find((i) => i.id === id)
  },
  create: async (invoice: Omit<Invoice, "id" | "createdAt" | "updatedAt">): Promise<Invoice> => {
    await delay(400)
    const newInvoice: Invoice = {
      ...invoice,
      id: `invoice-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    useStore.getState().addInvoice(newInvoice)
    return newInvoice
  },
  update: async (id: string, updates: Partial<Invoice>): Promise<Invoice> => {
    await delay(400)
    const invoice = useStore.getState().invoices.find((i) => i.id === id)
    if (!invoice) throw new Error("Invoice not found")
    const updated = { ...invoice, ...updates, updatedAt: new Date().toISOString() }
    useStore.getState().updateInvoice(id, updated)
    return updated
  },
  delete: async (id: string): Promise<void> => {
    await delay(300)
    useStore.getState().deleteInvoice(id)
  },
}

// Invoice Lines API
export const invoiceLinesApi = {
  getByInvoiceId: async (invoiceId: string): Promise<InvoiceLine[]> => {
    await delay(200)
    return useStore.getState().invoiceLines.filter((l) => l.invoiceId === invoiceId)
  },
  create: async (
    line: Omit<InvoiceLine, "id" | "createdAt" | "updatedAt">
  ): Promise<InvoiceLine> => {
    await delay(300)
    const newLine: InvoiceLine = {
      ...line,
      id: `line-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    useStore.getState().addInvoiceLine(newLine)
    return newLine
  },
  update: async (id: string, updates: Partial<InvoiceLine>): Promise<InvoiceLine> => {
    await delay(300)
    const line = useStore.getState().invoiceLines.find((l) => l.id === id)
    if (!line) throw new Error("Invoice line not found")
    const updated = { ...line, ...updates, updatedAt: new Date().toISOString() }
    useStore.getState().updateInvoiceLine(id, updated)
    return updated
  },
  delete: async (id: string): Promise<void> => {
    await delay(200)
    useStore.getState().deleteInvoiceLine(id)
  },
}

// Payments API
export const paymentsApi = {
  getAll: async (): Promise<Payment[]> => {
    await delay(300)
    return useStore.getState().payments
  },
  getById: async (id: string): Promise<Payment | undefined> => {
    await delay(200)
    return useStore.getState().payments.find((p) => p.id === id)
  },
  create: async (payment: Omit<Payment, "id" | "createdAt" | "updatedAt">): Promise<Payment> => {
    await delay(400)
    const newPayment: Payment = {
      ...payment,
      id: `payment-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    useStore.getState().addPayment(newPayment)
    return newPayment
  },
  update: async (id: string, updates: Partial<Payment>): Promise<Payment> => {
    await delay(400)
    const payment = useStore.getState().payments.find((p) => p.id === id)
    if (!payment) throw new Error("Payment not found")
    const updated = { ...payment, ...updates, updatedAt: new Date().toISOString() }
    useStore.getState().updatePayment(id, updated)
    return updated
  },
  delete: async (id: string): Promise<void> => {
    await delay(300)
    useStore.getState().deletePayment(id)
  },
}

// Currencies API
export const currenciesApi = {
  getAll: async (): Promise<CurrencyRate[]> => {
    await delay(300)
    return useStore.getState().currencies
  },
  update: async (id: string, updates: Partial<CurrencyRate>): Promise<CurrencyRate> => {
    await delay(400)
    const currency = useStore.getState().currencies.find((c) => c.id === id)
    if (!currency) throw new Error("Currency not found")
    const updated = { ...currency, ...updates, lastUpdated: new Date().toISOString() }
    useStore.getState().updateCurrency(id, updated)
    return updated
  },
}
