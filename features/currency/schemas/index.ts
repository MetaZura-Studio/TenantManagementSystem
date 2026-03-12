import { z } from "zod"

export const currencySchema = z.object({
  code: z.string().min(1, "Currency code is required"),
  nameEn: z.string().min(1, "Currency name (English) is required"),
  nameAr: z.string().min(1, "Currency name (Arabic) is required"),
  exchangeRate: z.number().min(0, "Exchange rate must be non-negative"),
  isActive: z.boolean().default(true),
})
