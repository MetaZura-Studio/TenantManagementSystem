"use client"

import { useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/shared/cards"
import { PageHeader } from "@/components/shared/page-header"
import { toast } from "@/components/shared/feedback/use-toast"
import { useCreateSubscription } from "../hooks"
import { useTenants } from "@/features/tenants/hooks"
import { usePlans } from "@/features/plans/hooks"
import { useCurrencies } from "@/features/currency/hooks"
import { Pricing, type PricingPlanCard } from "../components"
import { subscriptionSchema } from "../schemas"
import type { TenantSubscription } from "../types"
import { z } from "zod"

export function CreateSubscriptionPage() {
  const router = useRouter()
  const createMutation = useCreateSubscription()
  const { data: tenants = [] } = useTenants()
  const { data: plans = [] } = usePlans()
  const { data: currencies = [] } = useCurrencies()
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const subscriptionFormRef = useRef<HTMLDivElement>(null)

  const form = useForm<z.infer<typeof subscriptionSchema>>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      tenantId: "",
      planId: "",
      status: "Active",
      startDate: new Date().toISOString().split("T")[0],
      currentPeriodStart: new Date().toISOString().split("T")[0],
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      billingCurrency: "USD",
      unitPrice: 0,
      discountAmount: 0,
      discountPercent: 0,
      autoRenew: true,
      cancelAtPeriodEnd: false,
      notes: "",
    },
  })

  const pricingPlans: PricingPlanCard[] = useMemo(() => {
    return plans.map((plan) => {
      let features: string[] = []
      if (plan.featuresJson) {
        try {
          const parsed = JSON.parse(plan.featuresJson)
          if (Array.isArray(parsed)) features = parsed.map((x) => String(x))
        } catch {
          // ignore bad JSON; show empty features list
        }
      }

      return {
        id: plan.id,
        name: (plan.nameEn || plan.planCode).toUpperCase(),
        price: Number(plan.monthlyPrice ?? 0),
        yearlyPrice: Number(plan.yearlyPrice ?? 0),
        period: "month",
        features,
        description: plan.description || "",
        isPopular: false,
        currency: plan.currencyCode,
      } satisfies PricingPlanCard
    })
  }, [plans])

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId)
    const plan = plans.find((p) => p.id === planId)
    if (!plan) return

    form.setValue("planId", plan.id, { shouldDirty: true, shouldValidate: true })
    form.setValue("billingCurrency", plan.currencyCode, { shouldDirty: true, shouldValidate: true })
    const unitPrice =
      plan.billingCycle === "Yearly" ? Number(plan.yearlyPrice ?? 0) : Number(plan.monthlyPrice ?? 0)
    form.setValue("unitPrice", unitPrice, { shouldDirty: true, shouldValidate: true })

    // Scroll to subscription form after a short delay to ensure state updates
    setTimeout(() => {
      subscriptionFormRef.current?.scrollIntoView({ 
        behavior: "smooth", 
        block: "start" 
      })
    }, 100)
  }

  const onSubmit = (data: z.infer<typeof subscriptionSchema>) => {
    const subscriptionData: Omit<TenantSubscription, "id" | "createdAt" | "updatedAt"> = {
      subscriptionId: `SUB-${Date.now().toString().slice(-6)}`,
      tenantId: data.tenantId,
      planId: data.planId,
      status: data.status,
      startDate: data.startDate,
      currentPeriodStart: data.currentPeriodStart,
      currentPeriodEnd: data.currentPeriodEnd,
      canceledAt: data.canceledAt,
      trialStart: data.trialStart,
      trialEnd: data.trialEnd,
      billingCurrency: data.billingCurrency,
      unitPrice: data.unitPrice,
      discountAmount: data.discountAmount,
      discountPercent: data.discountPercent,
      autoRenew: data.autoRenew,
      cancelAtPeriodEnd: data.cancelAtPeriodEnd,
      notes: data.notes || undefined,
    }
    createMutation.mutate(subscriptionData, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Subscription created successfully",
        })
        router.push("/tenant-subscriptions")
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to create subscription",
          variant: "destructive",
        })
      },
    })
  }

  return (
    <>
      <PageHeader
        title="Create Subscription"
        subtitle="Add a new tenant subscription"
        breadcrumbs={[
          { label: "Plans & Subscriptions", href: "/plans" },
          { label: "Tenant Subscriptions", href: "/tenant-subscriptions" },
          { label: "Create Subscription" },
        ]}
      />

      {/* Pricing Cards Section */}
      {pricingPlans.length > 0 && (
        <div className="mb-6 w-full">
          <Pricing
            plans={pricingPlans}
            onSelectPlan={handleSelectPlan}
            selectedPlanId={selectedPlanId}
            title="Simple, Transparent Pricing"
            description="Choose the plan that works for you\nAll plans include access to our platform, lead generation tools, and dedicated support."
          />
        </div>
      )}

      {/* Subscription Information Form - Only shown after plan selection */}
      {selectedPlanId && (
        <GlassCard variant="default" className="max-w-4xl" ref={subscriptionFormRef}>
          <GlassCardHeader>
            <GlassCardTitle>Subscription Information</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Tenant Field - Full Width at Top */}
                <FormField
                  control={form.control}
                  name="tenantId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tenant</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select tenant" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tenants.map((tenant) => (
                            <SelectItem key={tenant.id} value={tenant.id}>
                              {tenant.tenantName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="planId"
                  render={({ field }) => {
                    const matchedPlan = plans.find((p) => p.id === (field.value || "")) || null
                    const displayValue = field.value || ""
                    
                    return (
                      <FormItem>
                        <FormLabel>Plan</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={displayValue}
                          disabled={!!selectedPlanId}
                        >
                          <FormControl>
                            <SelectTrigger className={selectedPlanId ? "bg-muted cursor-not-allowed" : ""}>
                              <SelectValue placeholder="Select plan">
                                {matchedPlan ? matchedPlan.nameEn : "Select plan"}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {plans.map((plan) => (
                              <SelectItem key={plan.id} value={plan.id}>
                                {plan.nameEn}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedPlanId && matchedPlan && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Auto-filled from selected plan
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )
                  }}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value || "Active"}
                        disabled={true}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-muted cursor-not-allowed">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Expired">Expired</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="TRIALING">TRIALING</SelectItem>
                          <SelectItem value="PAST_DUE">PAST_DUE</SelectItem>
                          <SelectItem value="CANCELED">CANCELED</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Defaults to Active for new subscriptions
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currentPeriodStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Period Start</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currentPeriodEnd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Period End</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="billingCurrency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Billing Currency</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currencies.map((c) => (
                            <SelectItem key={c.id} value={c.currencyCode}>
                              {c.currencyCode} - {c.currencyName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unitPrice"
                  render={({ field }) => {
                    const selectedPricingPlan = pricingPlans.find((p) => p.id === selectedPlanId)
                    const displayPrice = selectedPricingPlan ? selectedPricingPlan.price : field.value
                    
                    return (
                      <FormItem>
                        <FormLabel>Unit Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Enter unit price"
                            {...field}
                            value={displayPrice}
                            disabled={!!selectedPlanId}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            className={selectedPlanId ? "bg-muted cursor-not-allowed" : ""}
                          />
                        </FormControl>
                        {selectedPlanId && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Auto-filled from selected plan
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )
                  }}
                />

                <FormField
                  control={form.control}
                  name="discountAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Enter discount amount"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discountPercent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Percent</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Enter discount percent"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="autoRenew"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Auto Renew</FormLabel>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cancelAtPeriodEnd"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Cancel at Period End</FormLabel>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter notes (optional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border/30">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    size="lg"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                </div>
              </form>
            </Form>
          </GlassCardContent>
        </GlassCard>
      )}
    </>
  )
}
