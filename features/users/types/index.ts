export type UserStatus = "ACTIVE" | "INACTIVE" | "LOCKED";

export interface User {
  id: string;
  tenantId: string;
  branchId: string;
  roleId: string;
  fullNameEn: string;
  fullNameAr: string;
  username: string;
  email: string;
  mobile: string;
  passwordHash: string;
  status: UserStatus;
  address?: string;
  zipCode?: string;
  country?: string;
  lastLoginAt?: string;

  // System audit fields (read-only, auto-managed)
  createdAt: string;
  createdBy?: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface CreateUserPayload {
  tenantId: string;
  branchId: string;
  roleId: string;
  fullNameEn: string;
  fullNameAr: string;
  username: string;
  email: string;
  mobile: string;
  passwordHash: string;
  status: UserStatus;
  address?: string;
  zipCode?: string;
  country?: string;
}

export interface UpdateUserPayload {
  id: string;
  tenantId?: string;
  branchId?: string;
  roleId?: string;
  fullNameEn?: string;
  fullNameAr?: string;
  username?: string;
  email?: string;
  mobile?: string;
  passwordHash?: string;
  status?: UserStatus;
  address?: string;
  zipCode?: string;
  country?: string;
  lastLoginAt?: string;
}

export interface UserListFilters {
  search?: string;
  status?: UserStatus | "ALL";
  tenantId?: string;
  branchId?: string;
  roleId?: string;
}
