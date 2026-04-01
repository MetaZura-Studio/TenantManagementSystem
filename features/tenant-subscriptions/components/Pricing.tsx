"use client"

import { useRef, useState } from "react"
import { motion } from "framer-motion"
import confetti from "canvas-confetti"
import NumberFlow from "@number-flow/react"
import { Check } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/components/shared/hooks/use-media-query"

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
  onSelectPlan: (planId: string) => void
  selectedPlanId?: string | null
}

export function Pricing({
  plans,
  title = "Choose a plan",
  description = "Pick one of these plans to start a subscription.\nYou can review/edit details on the next step.",
  onSelectPlan,
  selectedPlanId,
}: PricingProps) {
  const [isMonthly, setIsMonthly] = useState(true)
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const switchRef = useRef<HTMLButtonElement>(null)

  const handleToggle = (checked: boolean) => {
    setIsMonthly(!checked)
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect()
      const x = rect.left + rect.width / 2
      const y = rect.top + rect.height / 2

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { x: x / window.innerWidth, y: y / window.innerHeight },
        colors: [
          "hsl(var(--primary))",
          "hsl(var(--accent))",
          "hsl(var(--secondary))",
          "hsl(var(--muted))",
        ],
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
        shapes: ["circle"],
      })
    }
  }

  return (
    <div className="w-full py-8">
      <div className="text-center space-y-3 mb-8">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
        <p className="text-muted-foreground text-base whitespace-pre-line">{description}</p>
      </div>

      <div className="flex justify-center items-center mb-8">
        <label className="relative inline-flex items-center cursor-pointer">
          <Label>
            <Switch
              ref={switchRef as any}
              checked={!isMonthly}
              onCheckedChange={handleToggle}
              className="relative"
            />
          </Label>
        </label>
        <span className="ml-2 font-semibold">
          Annual billing <span className="text-primary">(Save 20%)</span>
        </span>
      </div>

      <div className="flex flex-row justify-center items-center gap-4 mx-auto px-4">
        {plans.map((plan, index) => {
          const selected = selectedPlanId === plan.id
          const currency = plan.currency ?? "USD"
          const displayValue = isMonthly ? plan.price : plan.yearlyPrice
          const displayPeriod = isMonthly ? "month" : "year"

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.4,
                delay: index * 0.1,
              }}
              className={cn(
                "rounded-2xl border p-4 bg-background text-center relative flex flex-col w-[400px] h-[400px] transition-all duration-300 cursor-pointer",
                "border-border",
                selected ? "border-blue-500 border-4 ring-4 ring-blue-500/20 shadow-lg" : "",
                !selected && "hover:border-blue-400 hover:shadow-xl hover:scale-105 hover:bg-muted/20",
                selected && "hover:border-blue-500 hover:shadow-xl"
              )}
            >

              <div className="flex-1 flex flex-col justify-between overflow-hidden">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-3">{plan.name}</p>

                  <div className="flex items-center justify-center gap-x-1 mb-1">
                    <span className="text-3xl font-bold tracking-tight text-foreground">
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
                    <span className="text-xs font-semibold text-muted-foreground">
                      /{displayPeriod}
                    </span>
                  </div>

                  <p className="text-[10px] leading-4 text-muted-foreground mb-3">{isMonthly ? "billed monthly" : "billed annually"}</p>

                  <ul className="mt-3 gap-1.5 flex flex-col">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <Check className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-left text-xs leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto pt-3">
                  <hr className="w-full mb-3" />
                  <Button
                    type="button"
                    onClick={() => onSelectPlan(plan.id)}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "w-full text-sm font-semibold transition-all py-2",
                      "hover:ring-2 hover:ring-primary hover:ring-offset-1 hover:bg-primary hover:text-primary-foreground",
                      selected ? "bg-primary text-primary-foreground" : "bg-background text-foreground"
                    )}
                  >
                    {selected ? "Selected" : "Choose Plan"}
                  </Button>
                  <p className="mt-2 text-[10px] leading-tight text-muted-foreground">{plan.description}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

