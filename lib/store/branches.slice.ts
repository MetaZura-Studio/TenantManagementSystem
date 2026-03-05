import { StateCreator } from "zustand"
import type { Branch } from "@/features/branches/types"

export interface BranchesSlice {
  branches: Branch[]
  setBranches: (branches: Branch[]) => void
  addBranch: (branch: Branch) => void
  updateBranch: (id: string, branch: Partial<Branch>) => void
  deleteBranch: (id: string) => void
}

export const createBranchesSlice: StateCreator<
  BranchesSlice,
  [],
  [],
  BranchesSlice
> = (set) => ({
  branches: [],
  setBranches: (branches) => set({ branches }),
  addBranch: (branch) => set((state) => ({ branches: [...state.branches, branch] })),
  updateBranch: (id, updates) =>
    set((state) => ({
      branches: state.branches.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    })),
  deleteBranch: (id) =>
    set((state) => ({ branches: state.branches.filter((b) => b.id !== id) })),
})
