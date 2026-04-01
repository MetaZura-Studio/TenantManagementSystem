"use client"

import { useEffect, useRef } from "react"
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
import { useSubscription, useUpdateSubscription } from "../hooks"
import { useTenants } from "@/features/tenants/hooks"
import { usePlans } from "@/features/plans/hooks"
import { useCurrencies } from "@/features/currency/hooks"
import { subscriptionSchema } from "../schemas"
import { z } from "zod"

interface EditSubscriptionPageProps {
  subscriptionId: string
}

export function EditSubscriptionPage({ subscriptionId }: EditSubscriptionPageProps) {
  const router = useRouter()
  const { data: subscription, isLoading } = useSubscription(subscriptionId)
  const { data: tenants = [] } = useTenants()
  const { data: plans = [] } = usePlans()
  const { data: currencies = [] } = useCurrencies()
  const updateMutation = useUpdateSubscription()
  const lastDiscountEditRef = useRef<"amount" | "percent" | null>(null)

  const form = useForm<z.infer<typeof subscriptionSchema>>({
    resolver: zodResolver(subscriptionSchema),
    values: subscription
      ? {
          tenantId: subscription.tenantId,
          planId: subscription.planId,
          status: subscription.status,
          startDate: subscription.startDate,
          currentPeriodStart: subscription.currentPeriodStart || subscription.startDate,
          currentPeriodEnd: subscription.currentPeriodEnd || subscription.startDate,
          canceledAt: subscription.canceledAt,
          trialStart: subscription.trialStart,
          trialEnd: subscription.trialEnd,
          billingCurrency: subscription.billingCurrency,
          unitPrice: subscription.unitPrice,
          discountAmount: subscription.discountAmount,
          discountPercent: subscription.discountPercent,
          autoRenew: subscription.autoRenew,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          notes: subscription.notes || "",
        }
      : undefined,
  })

  const unitPrice = form.watch("unitPrice")
  const discountAmount = form.watch("discountAmount")
  const discountPercent = form.watch("discountPercent")

  useEffect(() => {
    const base = Number(unitPrice ?? 0)
    if (!Number.isFinite(base) || base <= 0) {
      if (lastDiscountEditRef.current === "amount" && Number(discountPercent ?? 0) !== 0) {
        form.setValue("discountPercent", 0, { shouldDirty: true, shouldValidate: true })
      }
      if (lastDiscountEditRef.current === "percent" && Number(discountAmount ?? 0) !== 0) {
        form.setValue("discountAmount", 0, { shouldDirty: true, shouldValidate: true })
      }
      return
    }

    if (lastDiscountEditRef.current === "amount") {
      const amt = Math.max(0, Number(discountAmount ?? 0))
      const pct = (amt / base) * 100
      const pctRounded = Number(pct.toFixed(2))
      if (pctRounded !== Number(discountPercent ?? 0)) {
        form.setValue("discountPercent", pctRounded, { shouldDirty: true, shouldValidate: true })
      }
    }

    if (lastDiscountEditRef.current === "percent") {
      const pct = Math.max(0, Number(discountPercent ?? 0))
      const amt = (base * pct) / 100
      const amtRounded = Number(amt.toFixed(2))
      if (amtRounded !== Number(discountAmount ?? 0)) {
        form.setValue("discountAmount", amtRounded, { shouldDirty: true, shouldValidate: true })
      }
    }
  }, [unitPrice, discountAmount, discountPercent, form])

  const onSubmit = (data: z.infer<typeof subscriptionSchema>) => {
    updateMutation.mutate(
      { id: subscriptionId, updates: data },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Subscription updated successfully",
          })
          router.push(`/tenant-subscriptions/${subscriptionId}`)
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to update subscription",
            variant: "destructive",
          })
        },
      }
    )
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!subscription) {
    return <div className="text-center py-8">Subscription not found</div>
  }

  return (
    <>
      <PageHeader
        title="Edit Subscription"
        subtitle={`Subscription ${subscription.subscriptionId}`}
        breadcrumbs={[
          { label: "Plans & Subscriptions", href: "/plans" },
          { label: "Tenant Subscriptions", href: "/tenant-subscriptions" },
          { label: "Edit Subscription" },
        ]}
      />

      <GlassCard variant="default" className="max-w-4xl">
        <GlassCardHeader>
          <GlassCardTitle>Subscription Information</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="tenantId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tenant</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select tenant" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tenants.map((tenant) => (
                            <SelectItem key={tenant.id} value={tenant.id}>
                              {tenant.shopNameEn || tenant.tenantCode || tenant.id}
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
                  name="planId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select plan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {plans.map((plan) => (
                            <SelectItem key={plan.id} value={plan.id}>
                              {plan.nameEn || plan.planCode || plan.id}
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
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Enter unit price"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
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
                          onChange={(e) => {
                            lastDiscountEditRef.current = "amount"
                            field.onChange(parseFloat(e.target.value) || 0)
                          }}
                          value={field.value}
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
                          onChange={(e) => {
                            lastDiscountEditRef.current = "percent"
                            field.onChange(parseFloat(e.target.value) || 0)
                          }}
                          value={field.value}
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
                <Button type="submit" size="lg" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </Form>
        </GlassCardContent>
      </GlassCard>
    </>
  )
}
