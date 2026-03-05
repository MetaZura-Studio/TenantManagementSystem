import { create } from "zustand"
import { persist } from "zustand/middleware"
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
  Settings,
} from "../types"

interface StoreState {
  tenants: Tenant[]
  branches: Branch[]
  plans: Plan[]
  subscriptions: TenantSubscription[]
  users: User[]
  roles: Role[]
  invoices: Invoice[]
  invoiceLines: InvoiceLine[]
  payments: Payment[]
  currencies: CurrencyRate[]
  settings: Settings[]
}

interface StoreActions {
  // Tenants
  setTenants: (tenants: Tenant[]) => void
  addTenant: (tenant: Tenant) => void
  updateTenant: (id: string, tenant: Partial<Tenant>) => void
  deleteTenant: (id: string) => void

  // Branches
  setBranches: (branches: Branch[]) => void
  addBranch: (branch: Branch) => void
  updateBranch: (id: string, branch: Partial<Branch>) => void
  deleteBranch: (id: string) => void

  // Plans
  setPlans: (plans: Plan[]) => void
  addPlan: (plan: Plan) => void
  updatePlan: (id: string, plan: Partial<Plan>) => void
  deletePlan: (id: string) => void

  // Subscriptions
  setSubscriptions: (subscriptions: TenantSubscription[]) => void
  addSubscription: (subscription: TenantSubscription) => void
  updateSubscription: (id: string, subscription: Partial<TenantSubscription>) => void
  deleteSubscription: (id: string) => void

  // Users
  setUsers: (users: User[]) => void
  addUser: (user: User) => void
  updateUser: (id: string, user: Partial<User>) => void
  deleteUser: (id: string) => void

  // Roles
  setRoles: (roles: Role[]) => void
  addRole: (role: Role) => void
  updateRole: (id: string, role: Partial<Role>) => void
  deleteRole: (id: string) => void

  // Invoices
  setInvoices: (invoices: Invoice[]) => void
  addInvoice: (invoice: Invoice) => void
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void
  deleteInvoice: (id: string) => void

  // Invoice Lines
  setInvoiceLines: (lines: InvoiceLine[]) => void
  addInvoiceLine: (line: InvoiceLine) => void
  updateInvoiceLine: (id: string, line: Partial<InvoiceLine>) => void
  deleteInvoiceLine: (id: string) => void

  // Payments
  setPayments: (payments: Payment[]) => void
  addPayment: (payment: Payment) => void
  updatePayment: (id: string, payment: Partial<Payment>) => void
  deletePayment: (id: string) => void

  // Currencies
  setCurrencies: (currencies: CurrencyRate[]) => void
  updateCurrency: (id: string, currency: Partial<CurrencyRate>) => void

  // Settings
  setSettings: (settings: Settings[]) => void
  updateSetting: (key: string, value: string, category: string) => void
}

export const useStore = create<StoreState & StoreActions>()(
  persist(
    (set) => ({
      // Initial state
      tenants: [],
      branches: [],
      plans: [],
      subscriptions: [],
      users: [],
      roles: [],
      invoices: [],
      invoiceLines: [],
      payments: [],
      currencies: [],
      settings: [],

      // Tenants
      setTenants: (tenants) => set({ tenants }),
      addTenant: (tenant) => set((state) => ({ tenants: [...state.tenants, tenant] })),
      updateTenant: (id, updates) =>
        set((state) => ({
          tenants: state.tenants.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),
      deleteTenant: (id) =>
        set((state) => ({ tenants: state.tenants.filter((t) => t.id !== id) })),

      // Branches
      setBranches: (branches) => set({ branches }),
      addBranch: (branch) => set((state) => ({ branches: [...state.branches, branch] })),
      updateBranch: (id, updates) =>
        set((state) => ({
          branches: state.branches.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        })),
      deleteBranch: (id) =>
        set((state) => ({ branches: state.branches.filter((b) => b.id !== id) })),

      // Plans
      setPlans: (plans) => set({ plans }),
      addPlan: (plan) => set((state) => ({ plans: [...state.plans, plan] })),
      updatePlan: (id, updates) =>
        set((state) => ({
          plans: state.plans.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),
      deletePlan: (id) =>
        set((state) => ({ plans: state.plans.filter((p) => p.id !== id) })),

      // Subscriptions
      setSubscriptions: (subscriptions) => set({ subscriptions }),
      addSubscription: (subscription) =>
        set((state) => ({ subscriptions: [...state.subscriptions, subscription] })),
      updateSubscription: (id, updates) =>
        set((state) => ({
          subscriptions: state.subscriptions.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),
      deleteSubscription: (id) =>
        set((state) => ({ subscriptions: state.subscriptions.filter((s) => s.id !== id) })),

      // Users
      setUsers: (users) => set({ users }),
      addUser: (user) => set((state) => ({ users: [...state.users, user] })),
      updateUser: (id, updates) =>
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
        })),
      deleteUser: (id) =>
        set((state) => ({ users: state.users.filter((u) => u.id !== id) })),

      // Roles
      setRoles: (roles) => set({ roles }),
      addRole: (role) => set((state) => ({ roles: [...state.roles, role] })),
      updateRole: (id, updates) =>
        set((state) => ({
          roles: state.roles.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        })),
      deleteRole: (id) =>
        set((state) => ({ roles: state.roles.filter((r) => r.id !== id) })),

      // Invoices
      setInvoices: (invoices) => set({ invoices }),
      addInvoice: (invoice) => set((state) => ({ invoices: [...state.invoices, invoice] })),
      updateInvoice: (id, updates) =>
        set((state) => ({
          invoices: state.invoices.map((i) => (i.id === id ? { ...i, ...updates } : i)),
        })),
      deleteInvoice: (id) =>
        set((state) => ({ invoices: state.invoices.filter((i) => i.id !== id) })),

      // Invoice Lines
      setInvoiceLines: (lines) => set({ invoiceLines: lines }),
      addInvoiceLine: (line) =>
        set((state) => ({ invoiceLines: [...state.invoiceLines, line] })),
      updateInvoiceLine: (id, updates) =>
        set((state) => ({
          invoiceLines: state.invoiceLines.map((l) => (l.id === id ? { ...l, ...updates } : l)),
        })),
      deleteInvoiceLine: (id) =>
        set((state) => ({ invoiceLines: state.invoiceLines.filter((l) => l.id !== id) })),

      // Payments
      setPayments: (payments) => set({ payments }),
      addPayment: (payment) => set((state) => ({ payments: [...state.payments, payment] })),
      updatePayment: (id, updates) =>
        set((state) => ({
          payments: state.payments.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),
      deletePayment: (id) =>
        set((state) => ({ payments: state.payments.filter((p) => p.id !== id) })),

      // Currencies
      setCurrencies: (currencies) => set({ currencies }),
      updateCurrency: (id, updates) =>
        set((state) => ({
          currencies: state.currencies.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),

      // Settings
      setSettings: (settings) => set({ settings }),
      updateSetting: (key, value, category) =>
        set((state) => {
          const existing = state.settings.find((s) => s.key === key)
          if (existing) {
            return {
              settings: state.settings.map((s) =>
                s.key === key ? { ...s, value, updatedAt: new Date().toISOString() } : s
              ),
            }
          }
          return {
            settings: [
              ...state.settings,
              {
                id: `setting-${Date.now()}`,
                key,
                value,
                category,
                updatedAt: new Date().toISOString(),
              },
            ],
          }
        }),
    }),
    {
      name: "tenant-management-storage",
    }
  )
)
