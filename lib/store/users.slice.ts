import { StateCreator } from "zustand"
import type { User } from "@/features/users/types"

export interface UsersSlice {
  users: User[]
  setUsers: (users: User[]) => void
  addUser: (user: User) => void
  updateUser: (id: string, user: Partial<User>) => void
  deleteUser: (id: string) => void
}

export const createUsersSlice: StateCreator<
  UsersSlice,
  [],
  [],
  UsersSlice
> = (set) => ({
  users: [],
  setUsers: (users) => set({ users }),
  addUser: (user) => set((state) => ({ users: [...state.users, user] })),
  updateUser: (id, updates) =>
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
    })),
  deleteUser: (id) =>
    set((state) => ({ users: state.users.filter((u) => u.id !== id) })),
})
