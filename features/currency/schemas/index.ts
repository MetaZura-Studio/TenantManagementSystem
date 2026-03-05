import { z } from "zod"

export const currencyRateSchema = z.object({
  currencyCode: z.string().min(1, "Currency code is required"),
  currencyName: z.string().min(1, "Currency name is required"),
  exchangeRate: z.number().min(0, "Exchange rate must be non-negative"),
})
