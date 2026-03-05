import { useStore } from "../store"
import type { Plan } from "@/features/plans/types"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const plansApi = {
  getAll: async (): Promise<Plan[]> => {
    await delay(300)
    return useStore.getState().plans
  },
  getById: async (id: string): Promise<Plan | undefined> => {
    await delay(200)
    return useStore.getState().plans.find((p) => p.id === id)
  },
  create: async (plan: Omit<Plan, "id" | "createdAt" | "updatedAt">): Promise<Plan> => {
    await delay(400)
    const newPlan: Plan = {
      ...plan,
      id: `plan-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    useStore.getState().addPlan(newPlan)
    return newPlan
  },
  update: async (id: string, updates: Partial<Plan>): Promise<Plan> => {
    await delay(400)
    const plan = useStore.getState().plans.find((p) => p.id === id)
    if (!plan) throw new Error("Plan not found")
    const updated = { ...plan, ...updates, updatedAt: new Date().toISOString() }
    useStore.getState().updatePlan(id, updated)
    return updated
  },
  delete: async (id: string): Promise<void> => {
    await delay(300)
    useStore.getState().deletePlan(id)
  },
}
