import { useStore } from "./store"
import type { CurrencyRate } from "@/features/currency/types"

export function seedData() {
  const store = useStore.getState()

  // Seed Currencies
  if (store.currencies.length === 0) {
    const currencies: CurrencyRate[] = [
      {
        id: "currency-usd",
        currencyCode: "USD",
        currencyName: "United States Dollar",
        exchangeRate: 1.0,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "currency-eur",
        currencyCode: "EUR",
        currencyName: "Euro",
        exchangeRate: 0.95,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "currency-gbp",
        currencyCode: "GBP",
        currencyName: "British Pound",
        exchangeRate: 0.82,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "currency-jpy",
        currencyCode: "JPY",
        currencyName: "Japanese Yen",
        exchangeRate: 150.0,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "currency-kwd",
        currencyCode: "KWD",
        currencyName: "Kuwaiti Dinar",
        exchangeRate: 0.31,
        lastUpdated: new Date().toISOString(),
      },
    ]
    store.setCurrencies(currencies)
  }
}
