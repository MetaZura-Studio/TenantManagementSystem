import { useStore } from "../store";
import type {
  CreateUserPayload,
  UpdateUserPayload,
  User,
} from "@/features/users/types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const generateUserId = () => `user-${Date.now()}`;

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    await delay(300);
    return useStore.getState().users;
  },

  getById: async (id: string): Promise<User | undefined> => {
    await delay(200);
    return useStore.getState().users.find((user) => user.id === id);
  },

  create: async (payload: CreateUserPayload): Promise<User> => {
    await delay(400);

    const now = new Date().toISOString();

    const newUser: User = {
      id: generateUserId(),
      ...payload,
      createdAt: now,
      updatedAt: now,
    };

    useStore.getState().addUser(newUser);
    return newUser;
  },

  update: async (payload: UpdateUserPayload): Promise<User> => {
    await delay(400);

    const { id, ...updates } = payload;
    const existingUser = useStore
      .getState()
      .users.find((user) => user.id === id);

    if (!existingUser) {
      throw new Error("User not found");
    }

    const updatedUser: User = {
      ...existingUser,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    useStore.getState().updateUser(id, updatedUser);
    return updatedUser;
  },

  activate: async (id: string): Promise<User> => {
    return usersApi.update({
      id,
      status: "ACTIVE",
    });
  },

  deactivate: async (id: string): Promise<User> => {
    return usersApi.update({
      id,
      status: "INACTIVE",
    });
  },

  lock: async (id: string): Promise<User> => {
    return usersApi.update({
      id,
      status: "LOCKED",
    });
  },

  delete: async (id: string): Promise<void> => {
    await delay(300);
    useStore.getState().deleteUser(id);
  },
};
