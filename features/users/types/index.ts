export type UserStatus = "Active" | "Inactive"

export interface User {
  id: string
  userId: string
  username: string
  email: string
  mobile: string
  firstName?: string
  lastName?: string
  phone?: string
  address?: string
  tenantId: string
  branchId?: string
  roleId: string
  status: UserStatus
  createdAt: string
  updatedAt: string
}
