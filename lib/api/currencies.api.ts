export const currenciesApi = {
  getAll: async () => {
    const res = await fetch("/api/currencies", { cache: "no-store" })
    const data = (await res.json().catch(() => null)) as any
    if (!res.ok) throw new Error(data?.error?.message || "Failed to load currencies")
    return data as import("@/features/currency/types").CurrencyRate[]
  },
  create: async (payload: {
    currencyCode: string
    currencyName: string
    exchangeRate: number
    nameAr?: string
  }) => {
    const res = await fetch("/api/currencies", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    })
    const data = (await res.json().catch(() => null)) as any
    if (!res.ok) throw new Error(data?.error?.message || "Failed to create currency")
    return data as import("@/features/currency/types").CurrencyRate
  },
  update: async (code: string, updates: { exchangeRate?: number }) => {
    const res = await fetch(`/api/currencies/${encodeURIComponent(code)}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(updates),
    })
    const data = (await res.json().catch(() => null)) as any
    if (!res.ok) throw new Error(data?.error?.message || "Failed to update currency")
    return data as import("@/features/currency/types").CurrencyRate
  },
}
