// NOTE: Currency Lookup currently uses a lightweight in-app reference model
// (seeded via `lib/seed.ts`) rather than the MySQL `currencies` table.
export interface CurrencyRate {
  id: string
  currencyCode: string
  currencyName: string
  exchangeRate: number
  lastUpdated?: string
}

// Future (MySQL-backed) model placeholder.
export interface Currency {
  id: string
  code: string
  nameEn: string
  nameAr: string
  exchangeRate: number
  isActive: boolean
  lastUpdated?: string
  createdAt: string
  createdBy?: string
  updatedAt: string
  updatedBy?: string
}
