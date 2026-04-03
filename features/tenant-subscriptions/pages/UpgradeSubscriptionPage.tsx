"use client"

import { useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/shared/cards"
import { PageHeader } from "@/components/shared/page-header"
import { Pricing, type PricingPlanCard } from "../components"
import { usePlans } from "@/features/plans/hooks"
import { useTenants } from "@/features/tenants/hooks"
import { useSubscriptions } from "../hooks"

export function UpgradeSubscriptionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const subscriptionId = searchParams.get("subscriptionId") || ""

  const { data: subscriptions = [], isLoading: subsLoading } = useSubscriptions()
  const { data: tenants = [], isLoading: tenantsLoading } = useTenants()
  const { data: plans = [], isLoading: plansLoading } = usePlans()

  const subscription = useMemo(() => {
    if (!subscriptionId) return undefined
    return subscriptions.find((s) => s.id === subscriptionId)
  }, [subscriptions, subscriptionId])

  const tenant = useMemo(() => {
    if (!subscription?.tenantId) return undefined
    return tenants.find((t) => t.id === subscription.tenantId)
  }, [subscription?.tenantId, tenants])

  const currentPlan = useMemo(() => {
    if (!subscription?.planId) return undefined
    return plans.find((p) => p.id === subscription.planId)
  }, [plans, subscription?.planId])

  const pricingCards: PricingPlanCard[] = useMemo(() => {
    return plans
      .filter((p) => (p as any)?.isActive !== false)
      .map((plan) => {
        let features: string[] = []
        if ((plan as any).featuresJson) {
          try {
            const parsed = JSON.parse(String((plan as any).featuresJson))
            if (Array.isArray(parsed)) features = parsed.map((x) => String(x))
          } catch {
            // ignore
          }
        }

        // Pricing component expects monthly+yearly numbers and a period label.
        const monthly = Number((plan as any).monthlyPrice ?? 0)
        const yearly = Number((plan as any).yearlyPrice ?? 0)
        const billingCycle = String((plan as any).billingCycle ?? "Monthly")
        const period = billingCycle.toLowerCase().includes("year") ? "year" : "month"

        return {
          id: plan.id,
          name: plan.nameEn,
          price: monthly,
          yearlyPrice: yearly,
          period,
          currency: (plan as any).currencyCode ?? "USD",
          description: plan.description ?? "",
          features,
        } satisfies PricingPlanCard
      })
  }, [plans])

  const onSelectPlan = (planId: string) => {
    if (!subscription?.tenantId) return
    if (subscription.planId && String(planId) === String(subscription.planId)) return
    router.push(
      `/tenant-subscriptions/new?tenantId=${encodeURIComponent(subscription.tenantId)}&planId=${encodeURIComponent(
        planId
      )}&upgradeFrom=${encodeURIComponent(subscription.id)}`
    )
  }

  const loading = subsLoading || tenantsLoading || plansLoading

  return (
    <>
      <PageHeader
        title="Subscription Upgrade"
        subtitle="Upgrade tenant subscription plan"
        breadcrumbs={[
          { label: "Plans & Subscriptions", href: "/plans" },
          { label: "Tenant Subscriptions", href: "/tenant-subscriptions" },
          { label: "Subscription Upgrade" },
        ]}
        actions={
          <Button variant="outline" size="lg" onClick={() => router.back()}>
            Back
          </Button>
        }
      />

      {loading ? (
        <GlassCard variant="subtle">
          <GlassCardContent className="p-12">
            <div className="text-center text-muted-foreground">Loading...</div>
          </GlassCardContent>
        </GlassCard>
      ) : !subscription ? (
        <GlassCard variant="subtle">
          <GlassCardContent className="p-12">
            <div className="text-center text-muted-foreground">
              Please open this screen from a subscription row (missing subscriptionId).
            </div>
          </GlassCardContent>
        </GlassCard>
      ) : (
        <div className="space-y-6">
          <GlassCard variant="default" className="max-w-5xl">
            <GlassCardHeader>
              <GlassCardTitle>Current Subscription</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <div className="text-sm text-muted-foreground">Tenant</div>
                  <div className="text-lg font-semibold">
                    {tenant?.shopNameEn || tenant?.tenantCode || subscription.tenantId}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Current Plan</div>
                  <div className="text-lg font-semibold">{currentPlan?.nameEn || subscription.planId}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <div className="text-lg font-semibold">{subscription.status}</div>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>

          <div className="max-w-6xl">
            <Pricing
              plans={pricingCards}
              selectedPlanId={subscription?.planId ?? null}
              onSelectPlan={onSelectPlan}
              title="Available Plans"
              description="Choose a plan to upgrade to. Your current plan is highlighted."
            />
          </div>
        </div>
      )}
    </>
  )
}

