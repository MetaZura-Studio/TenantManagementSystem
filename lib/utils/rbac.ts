import type { Permission } from "@/features/roles/types"

// RBAC Modules
export const RBAC_MODULES = [
  "Dashboard",
  "Branch",
  "Users",
  "Customers",
  "Measurements",
  "Products",
  "Orders",
  "Payments",
  "Production",
  "Reports",
  "Settings",
] as const

export type RBACModule = typeof RBAC_MODULES[number]

/**
 * Helper function to create a permission object
 */
export function createPermission(
  module: string,
  view: boolean = false,
  create: boolean = false,
  edit: boolean = false,
  canDelete: boolean = false,
  print: boolean = false
): Permission {
  return {
    module,
    view,
    create,
    edit,
    delete: canDelete,
    print,
  }
}

/**
 * Helper function to create permissions for a role based on action codes
 * V = View, C = Create, E = Edit, D = Delete, P = Print, X = No Access
 */
export function createPermissionsFromCodes(
  module: string,
  codes: string
): Permission {
  return {
    module,
    view: codes.includes("V"),
    create: codes.includes("C"),
    edit: codes.includes("E"),
    delete: codes.includes("D"),
    print: codes.includes("P"),
  }
}

/**
 * RBAC Matrix - Defines permissions for each role
 * Based on the Dishdasha Management System RBAC specification
 */
export const RBAC_MATRIX: Record<string, Record<string, string>> = {
  Owner: {
    Dashboard: "V",
    Branch: "C,E,D",
    Users: "C,E,D",
    Customers: "C,E",
    Measurements: "C,E,P",
    Products: "C,E,D",
    Orders: "C,E,D,P",
    Payments: "C",
    Production: "V",
    Reports: "V",
    Settings: "C,E",
  },
  Seller: {
    Dashboard: "V",
    Branch: "X",
    Users: "X",
    Customers: "C,E",
    Measurements: "C,E,P",
    Products: "V",
    Orders: "C,E,P",
    Payments: "C",
    Production: "V",
    Reports: "V",
    Settings: "X",
  },
  Supervisor: {
    Dashboard: "V",
    Branch: "X",
    Users: "X",
    Customers: "V",
    Measurements: "P",
    Products: "V",
    Orders: "E,P",
    Payments: "V",
    Production: "E",
    Reports: "V",
    Settings: "X",
  },
  Cutter: {
    Dashboard: "V",
    Branch: "X",
    Users: "X",
    Customers: "X",
    Measurements: "X",
    Products: "X",
    Orders: "V",
    Payments: "X",
    Production: "E",
    Reports: "X",
    Settings: "X",
  },
  Tailor: {
    Dashboard: "V",
    Branch: "X",
    Users: "X",
    Customers: "X",
    Measurements: "P",
    Products: "X",
    Orders: "V",
    Payments: "X",
    Production: "E",
    Reports: "X",
    Settings: "X",
  },
  Iron: {
    Dashboard: "V",
    Branch: "X",
    Users: "X",
    Customers: "X",
    Measurements: "X",
    Products: "X",
    Orders: "V",
    Payments: "X",
    Production: "V",
    Reports: "X",
    Settings: "X",
  },
}

/**
 * Get permissions for a specific role
 */
export function getRolePermissions(roleName: string): Permission[] {
  const rolePermissions = RBAC_MATRIX[roleName]
  if (!rolePermissions) {
    return RBAC_MODULES.map((module) => createPermission(module))
  }

  return RBAC_MODULES.map((module) => {
    const codes = rolePermissions[module] || "X"
    return createPermissionsFromCodes(module, codes)
  })
}
