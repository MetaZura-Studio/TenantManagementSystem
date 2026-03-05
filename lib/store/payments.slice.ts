import { StateCreator } from "zustand"
import type { Payment } from "@/features/payments/types"

export interface PaymentsSlice {
  payments: Payment[]
  setPayments: (payments: Payment[]) => void
  addPayment: (payment: Payment) => void
  updatePayment: (id: string, payment: Partial<Payment>) => void
  deletePayment: (id: string) => void
}

export const createPaymentsSlice: StateCreator<
  PaymentsSlice,
  [],
  [],
  PaymentsSlice
> = (set) => ({
  payments: [],
  setPayments: (payments) => set({ payments }),
  addPayment: (payment) => set((state) => ({ payments: [...state.payments, payment] })),
  updatePayment: (id, updates) =>
    set((state) => ({
      payments: state.payments.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),
  deletePayment: (id) =>
    set((state) => ({ payments: state.payments.filter((p) => p.id !== id) })),
})
