export interface Branch {
  id: string
  tenantId: string
  branchName: string
  phoneNumber: string
  email?: string
  contactPerson?: string
  addressLine1: string
  addressLine2?: string
  city: string
  stateProvince: string
  zipPostalCode: string
  branchStatus: "Active" | "Inactive"
  remarks?: string
  createdAt: string
  updatedAt: string
}
