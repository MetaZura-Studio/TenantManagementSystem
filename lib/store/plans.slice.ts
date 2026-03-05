import { StateCreator } from "zustand"
import type { Plan } from "@/features/plans/types"

export interface PlansSlice {
  plans: Plan[]
  setPlans: (plans: Plan[]) => void
  addPlan: (plan: Plan) => void
  updatePlan: (id: string, plan: Partial<Plan>) => void
  deletePlan: (id: string) => void
}

export const createPlansSlice: StateCreator<
  PlansSlice,
  [],
  [],
  PlansSlice
> = (set) => ({
  plans: [],
  setPlans: (plans) => set({ plans }),
  addPlan: (plan) => set((state) => ({ plans: [...state.plans, plan] })),
  updatePlan: (id, updates) =>
    set((state) => ({
      plans: state.plans.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),
  deletePlan: (id) =>
    set((state) => ({ plans: state.plans.filter((p) => p.id !== id) })),
})
