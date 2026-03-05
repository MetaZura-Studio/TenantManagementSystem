import { useStore } from "../store"
import type { Tenant } from "@/features/tenants/types"

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

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
