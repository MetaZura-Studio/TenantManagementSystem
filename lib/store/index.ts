import { create } from "zustand"
import { persist } from "zustand/middleware"
import { createTenantsSlice, type TenantsSlice } from "./tenants.slice"
import { createBranchesSlice, type BranchesSlice } from "./branches.slice"
import { createPlansSlice, type PlansSlice } from "./plans.slice"
import { createTenantSubscriptionsSlice, type TenantSubscriptionsSlice } from "./tenant-subscriptions.slice"
import { createUsersSlice, type UsersSlice } from "./users.slice"
import { createRolesSlice, type RolesSlice } from "./roles.slice"
import { createInvoicesSlice, type InvoicesSlice } from "./invoices.slice"
import { createPaymentsSlice, type PaymentsSlice } from "./payments.slice"
import { createCurrenciesSlice, type CurrenciesSlice } from "./currencies.slice"
import { createSettingsSlice, type SettingsSlice } from "./settings.slice"

export type StoreState = TenantsSlice &
  BranchesSlice &
  PlansSlice &
  TenantSubscriptionsSlice &
  UsersSlice &
  RolesSlice &
  InvoicesSlice &
  PaymentsSlice &
  CurrenciesSlice &
  SettingsSlice

export const useStore = create<StoreState>()(
  persist(
    (...args) => ({
      ...createTenantsSlice(...args),
      ...createBranchesSlice(...args),
      ...createPlansSlice(...args),
      ...createTenantSubscriptionsSlice(...args),
      ...createUsersSlice(...args),
      ...createRolesSlice(...args),
      ...createInvoicesSlice(...args),
      ...createPaymentsSlice(...args),
      ...createCurrenciesSlice(...args),
      ...createSettingsSlice(...args),
    }),
    {
      name: "tenant-management-storage",
    }
  )
)
