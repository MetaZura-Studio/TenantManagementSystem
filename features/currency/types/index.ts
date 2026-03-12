export interface Currency {
  id: string
  code: string
  nameEn: string
  nameAr: string
  exchangeRate: number
  isActive: boolean
  lastUpdated?: string
  // System audit fields (read-only, auto-managed)
  createdAt: string
  createdBy?: string
  updatedAt: string
  updatedBy?: string
}
