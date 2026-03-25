import { useStore } from "../store";
import type {
  CreateRolePayload,
  Role,
  UpdateRolePayload,
} from "@/features/roles/types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const generateRoleId = () => `role-${Date.now()}`;

export const rolesApi = {
  getAll: async (): Promise<Role[]> => {
    await delay(300);
    return useStore.getState().roles;
  },

  getById: async (id: string): Promise<Role | undefined> => {
    await delay(200);
    return useStore.getState().roles.find((role) => role.id === id);
  },

  create: async (payload: CreateRolePayload): Promise<Role> => {
    await delay(400);

    const now = new Date().toISOString();

    const newRole: Role = {
      id: generateRoleId(),
      ...payload,
      createdAt: now,
      updatedAt: now,
    };

    useStore.getState().addRole(newRole);
    return newRole;
  },

  update: async (payload: UpdateRolePayload): Promise<Role> => {
    await delay(400);

    const { id, ...updates } = payload;
    const existingRole = useStore
      .getState()
      .roles.find((role) => role.id === id);

    if (!existingRole) {
      throw new Error("Role not found");
    }

    const updatedRole: Role = {
      ...existingRole,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    useStore.getState().updateRole(id, updatedRole);
    return updatedRole;
  },

  activate: async (id: string): Promise<Role> => {
    return rolesApi.update({
      id,
      status: "Active",
    });
  },

  deactivate: async (id: string): Promise<Role> => {
    return rolesApi.update({
      id,
      status: "Inactive",
    });
  },

  delete: async (id: string): Promise<void> => {
    await delay(300);
    useStore.getState().deleteRole(id);
  },
};
