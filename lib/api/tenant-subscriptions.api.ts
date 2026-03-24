import { useStore } from "../store"
import type {
  CreateTenantSubscriptionPayload,
  TenantSubscription,
  UpdateTenantSubscriptionPayload,
} from "@/features/tenant-subscriptions/types"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const generateSubscriptionId = () => `sub-${Date.now()}`
const generateSubscriptionCode = () => `SUB-${Date.now()}`

export const tenantSubscriptionsApi = {
  getAll: async (): Promise<TenantSubscription[]> => {
    await delay(300)
    return useStore.getState().subscriptions
  },

  getById: async (id: string): Promise<TenantSubscription | undefined> => {
    await delay(200)
    return useStore
      .getState()
      .subscriptions.find((subscription) => subscription.id === id)
  },

  create: async (
    payload: CreateTenantSubscriptionPayload
  ): Promise<TenantSubscription> => {
    await delay(400)

    const now = new Date().toISOString()

    const newSubscription: TenantSubscription = {
      id: generateSubscriptionId(),
      subscriptionCode: generateSubscriptionCode(),
      ...payload,
      createdAt: now,
      updatedAt: now,
    }

    useStore.getState().addSubscription(newSubscription)
    return newSubscription
  },

  update: async (
    payload: UpdateTenantSubscriptionPayload
  ): Promise<TenantSubscription> => {
    await delay(400)

    const { id, ...updates } = payload
    const existingSubscription = useStore
      .getState()
      .subscriptions.find((subscription) => subscription.id === id)

    if (!existingSubscription) {
      throw new Error("Subscription not found")
    }

    const updatedSubscription: TenantSubscription = {
      ...existingSubscription,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    useStore.getState().updateSubscription(id, updatedSubscription)
    return updatedSubscription
  },

  activate: async (id: string): Promise<TenantSubscription> => {
    return tenantSubscriptionsApi.update({
      id,
      status: "ACTIVE",
      lockedAt: undefined,
    })
  },

  suspend: async (id: string): Promise<TenantSubscription> => {
    return tenantSubscriptionsApi.update({
      id,
      status: "SUSPENDED",
      lockedAt: new Date().toISOString(),
    })
  },

  cancel: async (id: string): Promise<TenantSubscription> => {
    const now = new Date().toISOString()

    return tenantSubscriptionsApi.update({
      id,
      status: "CANCELLED",
      cancelledAt: now,
      autoRenew: false,
    })
  },

  expire: async (id: string): Promise<TenantSubscription> => {
    return tenantSubscriptionsApi.update({
      id,
      status: "EXPIRED",
      autoRenew: false,
    })
  },

  delete: async (id: string): Promise<void> => {
    await delay(300)
    useStore.getState().deleteSubscription(id)
  },
}
