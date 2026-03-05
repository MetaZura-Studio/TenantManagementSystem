import { useStore } from "../store"
import type { CurrencyRate } from "@/features/currency/types"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const currenciesApi = {
  getAll: async (): Promise<CurrencyRate[]> => {
    await delay(300)
    return useStore.getState().currencies
  },
  update: async (id: string, updates: Partial<CurrencyRate>): Promise<CurrencyRate> => {
    await delay(400)
    const currency = useStore.getState().currencies.find((c) => c.id === id)
    if (!currency) throw new Error("Currency not found")
    const updated = { ...currency, ...updates, lastUpdated: new Date().toISOString() }
    useStore.getState().updateCurrency(id, updated)
    return updated
  },
}
