import { z } from "zod"

export const planSchema = z.object({
  planCode: z.string().min(1, "Plan code is required"),
  nameEn: z.string().min(1, "Plan name (English) is required"),
  nameAr: z.string().min(1, "Plan name (Arabic) is required"),
  description: z.string().optional(),
  billingCycle: z.enum(["Monthly", "Yearly"]),
  currencyCode: z.string().min(1, "Currency code is required"),
  monthlyPrice: z.number().min(0, "Monthly price must be non-negative"),
  yearlyPrice: z.number().min(0, "Yearly price must be non-negative"),
  maxBranches: z.number().min(0, "Max branches must be non-negative"),
  maxUsers: z.number().min(0, "Max users must be non-negative"),
  isActive: z.boolean(),
  featuresJson: z.string().optional(),
})
