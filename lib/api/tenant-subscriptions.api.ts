import { useStore } from "../store"
import type { TenantSubscription } from "@/features/tenant-subscriptions/types"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const tenantSubscriptionsApi = {
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
