import { StateCreator } from "zustand"
import type { TenantSubscription } from "@/features/tenant-subscriptions/types"

export interface TenantSubscriptionsSlice {
  subscriptions: TenantSubscription[]
  setSubscriptions: (subscriptions: TenantSubscription[]) => void
  addSubscription: (subscription: TenantSubscription) => void
  updateSubscription: (id: string, subscription: Partial<TenantSubscription>) => void
  deleteSubscription: (id: string) => void
}

export const createTenantSubscriptionsSlice: StateCreator<
  TenantSubscriptionsSlice,
  [],
  [],
  TenantSubscriptionsSlice
> = (set) => ({
  subscriptions: [],
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
})
