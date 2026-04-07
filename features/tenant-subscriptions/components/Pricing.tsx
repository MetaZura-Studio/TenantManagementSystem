"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import NumberFlow from "@number-flow/react"
import { Check } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface PricingPlanCard {
  id: string
  name: string
  price: number
  yearlyPrice: number
  period: string
  features: string[]
  description: string
  isPopular?: boolean
  currency?: string
}

interface PricingProps {
  plans: PricingPlanCard[]
  title?: string
  description?: string
  onSelectPlan: (planId: string, billing: "monthly" | "yearly") => void
  selectedPlanId?: string | null
}

function BillingPill({
  value,
  onChange,
}: {
  value: "monthly" | "yearly"
  onChange: (value: "monthly" | "yearly") => void
}) {
  return (
    <div className="flex justify-center">
      <div className="relative mx-auto flex w-fit items-center gap-1 rounded-full border border-border/60 bg-white/70 dark:bg-gray-950/40 p-1 backdrop-blur-xl shadow-sm">
        <button
          type="button"
          onClick={() => onChange("monthly")}
          className={cn(
            "relative z-10 h-10 sm:h-11 rounded-full px-4 sm:px-6 text-sm font-semibold transition-colors",
            value === "monthly" ? "text-white" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {value === "monthly" ? (
            <motion.span
              layoutId="billing-pill"
              className="absolute inset-0 rounded-full bg-gradient-to-t from-blue-600 via-blue-500 to-blue-600 shadow-lg shadow-blue-600/25 ring-1 ring-blue-500/50"
              transition={{ type: "spring", stiffness: 520, damping: 36 }}
            />
          ) : null}
          <span className="relative">Monthly</span>
        </button>

        <button
          type="button"
          onClick={() => onChange("yearly")}
          className={cn(
            "relative z-10 h-10 sm:h-11 rounded-full px-4 sm:px-6 text-sm font-semibold transition-colors",
            value === "yearly" ? "text-white" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {value === "yearly" ? (
            <motion.span
              layoutId="billing-pill"
              className="absolute inset-0 rounded-full bg-gradient-to-t from-blue-600 via-blue-500 to-blue-600 shadow-lg shadow-blue-600/25 ring-1 ring-blue-500/50"
              transition={{ type: "spring", stiffness: 520, damping: 36 }}
            />
          ) : null}
          <span className="relative flex items-center gap-2">
            Yearly
            <span className="rounded-full bg-blue-50/90 dark:bg-blue-500/15 px-2 py-0.5 text-[11px] font-semibold text-foreground ring-1 ring-blue-500/20">
              Save 20%
            </span>
          </span>
        </button>
      </div>
    </div>
  )
}

export function Pricing({
  plans,
  title = "Choose a plan",
  description = "Pick one of these plans to start a subscription.\nYou can review/edit details on the next step.",
  onSelectPlan,
  selectedPlanId,
}: PricingProps) {
  const hasMonthly = plans.some((p) => Number(p.price ?? 0) > 0)
  const hasYearly = plans.some((p) => Number(p.yearlyPrice ?? 0) > 0)

  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly")

  const orderedPlans = useMemo(() => {
    if (!selectedPlanId) return plans
    // Stable ordering: selected plan first, then everything else in original order.
    return plans
      .map((p, idx) => ({ p, idx }))
      .sort((a, b) => {
        const aSel = a.p.id === selectedPlanId ? 0 : 1
        const bSel = b.p.id === selectedPlanId ? 0 : 1
        if (aSel !== bSel) return aSel - bSel
        return a.idx - b.idx
      })
      .map(({ p }) => p)
  }, [plans, selectedPlanId])

  // Ensure we don't show "$0/year" for monthly-only plan sets (and vice versa).
  useEffect(() => {
    if (!hasYearly && billing === "yearly") setBilling("monthly")
    if (!hasMonthly && billing === "monthly") setBilling("yearly")
  }, [hasMonthly, hasYearly, billing])

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border/50 bg-white/55 dark:bg-gray-950/30 backdrop-blur-xl py-10 px-4 sm:px-8">
      {/* soft blue spotlight like the reference */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 left-1/2 h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-4xl text-center space-y-3 mb-8">
        <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base whitespace-pre-line">{description}</p>
      </div>

      {hasMonthly && hasYearly ? (
        <div className="relative z-10 mb-8">
          <BillingPill
            value={billing}
            onChange={(next) => {
              setBilling(next)
            }}
          />
        </div>
      ) : null}

      <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 justify-items-center">
        {orderedPlans.map((plan, index) => {
          const selected = selectedPlanId === plan.id
          const currency = plan.currency ?? "USD"
          const displayValue = billing === "monthly" ? plan.price : plan.yearlyPrice
          const displayPeriod = billing === "monthly" ? "month" : "year"

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                duration: 0.35,
                delay: index * 0.08,
              }}
              className={cn(
                "relative w-full max-w-[420px] rounded-2xl border bg-white/80 dark:bg-gray-950/45 backdrop-blur-xl shadow-sm",
                "transition-all duration-300 will-change-transform",
                "px-6 pt-7 pb-6",
                selected
                  ? "border-blue-500/80 ring-2 ring-blue-500/30 shadow-lg shadow-blue-600/15"
                  : "border-border/70",
                // Popular plan should not get a special border — only the current plan does.
                !selected && "hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-600/10",
                selected && "hover:shadow-xl hover:shadow-blue-600/15"
              )}
            >
              {selected ? (
                <div className="absolute right-5 top-5 flex items-center gap-2">
                  {selected ? (
                    <div className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-md shadow-emerald-600/20">
                      Current plan
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="flex h-full flex-col">
                <div className="space-y-2">
                  <div className="text-left">
                    <div className="text-xl sm:text-2xl font-semibold text-foreground">{plan.name}</div>
                    <div className="text-sm text-muted-foreground">{plan.description}</div>
                  </div>

                  <div className="pt-3 text-left">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-semibold tracking-tight text-foreground">
                        <NumberFlow
                          value={Number(displayValue)}
                          format={{
                            style: "currency",
                            currency,
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }}
                          transformTiming={{ duration: 450, easing: "ease-out" }}
                          willChange
                          className="font-variant-numeric: tabular-nums"
                        />
                      </span>
                      <span className="text-muted-foreground">/{displayPeriod}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {billing === "monthly" ? "billed monthly" : "billed annually"}
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <Button
                    type="button"
                    onClick={() => onSelectPlan(plan.id, billing)}
                    className={cn(
                      "w-full rounded-xl py-6 text-base font-semibold transition-all",
                      "active:scale-[0.98]",
                      selected
                        ? "bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-600/25"
                        : "bg-gradient-to-b from-neutral-900 to-neutral-700 text-white shadow-lg shadow-neutral-900/25"
                    )}
                  >
                    {selected ? "Selected" : "Get started"}
                  </Button>
                </div>

                <div className="mt-6 flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="mt-0.5 grid h-7 w-7 place-content-center rounded-full bg-blue-50/80 dark:bg-blue-500/15 ring-1 ring-blue-500/25">
                          <Check className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                        </span>
                        <span className="text-sm text-muted-foreground leading-6">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 border-t border-border/50 pt-4 text-xs text-muted-foreground">
                  {selected ? "This is the current plan." : "You’ll confirm the upgrade on the next step."}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

