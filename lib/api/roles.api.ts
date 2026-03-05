import { useStore } from "../store"
import type { Role } from "@/features/roles/types"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const rolesApi = {
  getAll: async (): Promise<Role[]> => {
    await delay(300)
    return useStore.getState().roles
  },
  getById: async (id: string): Promise<Role | undefined> => {
    await delay(200)
    return useStore.getState().roles.find((r) => r.id === id)
  },
  create: async (role: Omit<Role, "id" | "createdAt" | "updatedAt">): Promise<Role> => {
    await delay(400)
    const newRole: Role = {
      ...role,
      id: `role-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    useStore.getState().addRole(newRole)
    return newRole
  },
  update: async (id: string, updates: Partial<Role>): Promise<Role> => {
    await delay(400)
    const role = useStore.getState().roles.find((r) => r.id === id)
    if (!role) throw new Error("Role not found")
    const updated = { ...role, ...updates, updatedAt: new Date().toISOString() }
    useStore.getState().updateRole(id, updated)
    return updated
  },
  delete: async (id: string): Promise<void> => {
    await delay(300)
    useStore.getState().deleteRole(id)
  },
}
