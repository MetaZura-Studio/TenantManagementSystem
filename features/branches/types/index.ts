export type BranchStatus = "ACTIVE" | "INACTIVE"

export interface Branch {
  id: string
  tenantId: string
  branchCode: string
  nameEn: string
  nameAr: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
  contactName: string
  status: BranchStatus
  remarks?: string
  // System audit fields (read-only, auto-managed)
  createdAt: string
  createdBy?: string
  updatedAt: string
  updatedBy?: string
}
