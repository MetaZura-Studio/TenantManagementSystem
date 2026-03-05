import { StateCreator } from "zustand"
import type { CurrencyRate } from "@/features/currency/types"

export interface CurrenciesSlice {
  currencies: CurrencyRate[]
  setCurrencies: (currencies: CurrencyRate[]) => void
  updateCurrency: (id: string, currency: Partial<CurrencyRate>) => void
}

export const createCurrenciesSlice: StateCreator<
  CurrenciesSlice,
  [],
  [],
  CurrenciesSlice
> = (set) => ({
  currencies: [],
  setCurrencies: (currencies) => set({ currencies }),
  updateCurrency: (id, updates) =>
    set((state) => ({
      currencies: state.currencies.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),
})
