import { StateCreator } from "zustand"
import type { Role } from "@/features/roles/types"

export interface RolesSlice {
  roles: Role[]
  setRoles: (roles: Role[]) => void
  addRole: (role: Role) => void
  updateRole: (id: string, role: Partial<Role>) => void
  deleteRole: (id: string) => void
}

export const createRolesSlice: StateCreator<
  RolesSlice,
  [],
  [],
  RolesSlice
> = (set) => ({
  roles: [],
  setRoles: (roles) => set({ roles }),
  addRole: (role) => set((state) => ({ roles: [...state.roles, role] })),
  updateRole: (id, updates) =>
    set((state) => ({
      roles: state.roles.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    })),
  deleteRole: (id) =>
    set((state) => ({ roles: state.roles.filter((r) => r.id !== id) })),
})
