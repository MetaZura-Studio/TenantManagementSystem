export interface Permission {
  module: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  print: boolean;
}

export type RoleStatus = "Active" | "Inactive";

export interface Role {
  id: string;
  roleName: string;
  description?: string;
  status: RoleStatus;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRolePayload {
  roleName: string;
  description?: string;
  status: RoleStatus;
  permissions: Permission[];
}

export interface UpdateRolePayload {
  id: string;
  roleName?: string;
  description?: string;
  status?: RoleStatus;
  permissions?: Permission[];
}

export interface RoleListFilters {
  search?: string;
  status?: RoleStatus | "ALL";
}
