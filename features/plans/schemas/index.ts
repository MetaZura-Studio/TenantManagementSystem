import { z } from "zod"

export function buildPlanSchema(args?: {
  required?: (field: string) => boolean
}) {
  const required = args?.required ?? (() => true)

  const sRequired = (field: string, message: string) =>
    required(field) ? z.string().min(1, message) : z.string().optional().default("")

  const nNonNeg = (field: string, message: string) =>
    required(field) ? z.number().min(0, message) : z.number().optional().default(0)

  return z
    .object({
      planCode: sRequired("planCode", "Plan code is required"),
      nameEn: sRequired("nameEn", "Plan name (English) is required"),
      nameAr: sRequired("nameAr", "Plan name (Arabic) is required"),
      description: z.string().optional(),
      billingCycle: z.enum(["Monthly", "Yearly", "Both"]),
      currencyCode: sRequired("currencyCode", "Currency code is required"),
      monthlyPrice: nNonNeg("monthlyPrice", "Monthly price must be non-negative"),
      yearlyPrice: nNonNeg("yearlyPrice", "Yearly price must be non-negative"),
      maxBranches: nNonNeg("maxBranches", "Max branches must be non-negative"),
      maxUsers: nNonNeg("maxUsers", "Max users must be non-negative"),
      isActive: z.boolean().default(true),
      featuresJson: z.string().optional(),
    })
    .superRefine((data, ctx) => {
  const monthly = Number(data.monthlyPrice ?? 0)
  const yearly = Number(data.yearlyPrice ?? 0)

  if (data.billingCycle === "Monthly") {
    if (required("monthlyPrice") && (!Number.isFinite(monthly) || monthly <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["monthlyPrice"],
        message: "Monthly price must be greater than 0 for monthly plans",
      })
    }
  }

  if (data.billingCycle === "Yearly") {
    if (required("yearlyPrice") && (!Number.isFinite(yearly) || yearly <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["yearlyPrice"],
        message: "Yearly price must be greater than 0 for yearly plans",
      })
    }
  }

  if (data.billingCycle === "Both") {
    if (required("monthlyPrice") && (!Number.isFinite(monthly) || monthly <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["monthlyPrice"],
        message: "Monthly price must be greater than 0 when billing cycle is Both",
      })
    }
    if (required("yearlyPrice") && (!Number.isFinite(yearly) || yearly <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["yearlyPrice"],
        message: "Yearly price must be greater than 0 when billing cycle is Both",
      })
    }
  }
    })
}

export const planSchema = buildPlanSchema()
