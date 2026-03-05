import { StateCreator } from "zustand"
import type { Tenant } from "@/features/tenants/types"

export interface TenantsSlice {
  tenants: Tenant[]
  setTenants: (tenants: Tenant[]) => void
  addTenant: (tenant: Tenant) => void
  updateTenant: (id: string, tenant: Partial<Tenant>) => void
  deleteTenant: (id: string) => void
}

export const createTenantsSlice: StateCreator<
  TenantsSlice,
  [],
  [],
  TenantsSlice
> = (set) => ({
  tenants: [],
  setTenants: (tenants) => set({ tenants }),
  addTenant: (tenant) => set((state) => ({ tenants: [...state.tenants, tenant] })),
  updateTenant: (id, updates) =>
    set((state) => ({
      tenants: state.tenants.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  deleteTenant: (id) =>
    set((state) => ({ tenants: state.tenants.filter((t) => t.id !== id) })),
})
