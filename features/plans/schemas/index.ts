import { z } from "zod"

export const planSchema = z.object({
  planCode: z.string().min(1, "Plan code is required"),
  planName: z.string().min(1, "Plan name is required"),
  description: z.string().optional(),
  billingCycle: z.enum(["Monthly", "Yearly"]),
  currency: z.string().min(1, "Currency is required"),
  price: z.number().min(0, "Price must be non-negative"),
  setupFee: z.number().min(0, "Setup fee must be non-negative"),
  trialDays: z.number().min(0, "Trial days must be non-negative"),
  gracePeriodDays: z.number().min(0, "Grace period days must be non-negative"),
  displayOrder: z.number().min(0),
  isActive: z.boolean(),
})
