import { useStore } from "../store"
import type { Payment } from "@/features/payments/types"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

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
