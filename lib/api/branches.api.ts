import { useStore } from "../store"
import type { Branch } from "@/features/branches/types"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const branchesApi = {
  getAll: async (): Promise<Branch[]> => {
    await delay(300)
    return useStore.getState().branches
  },
  getById: async (id: string): Promise<Branch | undefined> => {
    await delay(200)
    return useStore.getState().branches.find((b) => b.id === id)
  },
  create: async (branch: Omit<Branch, "id" | "createdAt" | "updatedAt">): Promise<Branch> => {
    await delay(400)
    const newBranch: Branch = {
      ...branch,
      id: `branch-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    useStore.getState().addBranch(newBranch)
    return newBranch
  },
  update: async (id: string, updates: Partial<Branch>): Promise<Branch> => {
    await delay(400)
    const branch = useStore.getState().branches.find((b) => b.id === id)
    if (!branch) throw new Error("Branch not found")
    const updated = { ...branch, ...updates, updatedAt: new Date().toISOString() }
    useStore.getState().updateBranch(id, updated)
    return updated
  },
  delete: async (id: string): Promise<void> => {
    await delay(300)
    useStore.getState().deleteBranch(id)
  },
}
