import { useStore } from "../store"
import type { User } from "@/features/users/types"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    await delay(300)
    return useStore.getState().users
  },
  getById: async (id: string): Promise<User | undefined> => {
    await delay(200)
    return useStore.getState().users.find((u) => u.id === id)
  },
  create: async (user: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> => {
    await delay(400)
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    useStore.getState().addUser(newUser)
    return newUser
  },
  update: async (id: string, updates: Partial<User>): Promise<User> => {
    await delay(400)
    const user = useStore.getState().users.find((u) => u.id === id)
    if (!user) throw new Error("User not found")
    const updated = { ...user, ...updates, updatedAt: new Date().toISOString() }
    useStore.getState().updateUser(id, updated)
    return updated
  },
  delete: async (id: string): Promise<void> => {
    await delay(300)
    useStore.getState().deleteUser(id)
  },
}
