export interface Permission {
  module: string
  view: boolean
  create: boolean
  edit: boolean
  delete: boolean
  print: boolean
}

export interface Role {
  id: string
  roleName: string
  description?: string
  status: "Active" | "Inactive"
  permissions: Permission[]
  createdAt: string
  updatedAt: string
}
