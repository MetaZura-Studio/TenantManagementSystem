"use client"

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
import { RequiredLabel } from "@/components/shared/forms/RequiredLabel"
import { useCreatePlan } from "../hooks"
import { useCurrencies } from "@/features/currency/hooks"
import { buildPlanSchema } from "../schemas"
import type { Plan } from "../types"
import { z } from "zod"
import { useRequiredFieldsMatrix } from "@/features/settings/hooks"
import { isRequired } from "@/lib/forms/required-fields"
import { useMemo } from "react"

export function CreatePlanPage() {
  const router = useRouter()
  const createMutation = useCreatePlan()
  const { data: currencies = [] } = useCurrencies()
  const { matrix } = useRequiredFieldsMatrix()
  const req = (field: string) => isRequired(matrix, "plans", field, true)

  const schema = useMemo(
    () =>
      buildPlanSchema({
        required: (field) => isRequired(matrix, "plans", field, true),
      }),
    [matrix]
  )

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      planCode: "",
      nameEn: "",
      nameAr: "",
      description: "",
      billingCycle: "Monthly",
      currencyCode: "USD",
      monthlyPrice: 0,
      yearlyPrice: 0,
      maxBranches: 0,
      maxUsers: 0,
      featuresJson: "",
      isActive: true,
    },
  })

  const billingCycle = form.watch("billingCycle")
  const needsMonthly = billingCycle === "Monthly" || billingCycle === "Both"
  const needsYearly = billingCycle === "Yearly" || billingCycle === "Both"

  const onSubmit = (data: z.infer<typeof schema>) => {
    const planData: Omit<Plan, "id" | "createdAt" | "updatedAt"> = {
      planCode: data.planCode,
      nameEn: data.nameEn,
      nameAr: data.nameAr,
      description: data.description || undefined,
      billingCycle: data.billingCycle,
      currencyCode: data.currencyCode,
      monthlyPrice: needsMonthly ? data.monthlyPrice : 0,
      yearlyPrice: needsYearly ? data.yearlyPrice : 0,
      maxBranches: data.maxBranches,
      maxUsers: data.maxUsers,
      isActive: data.isActive,
      featuresJson: data.featuresJson || undefined,
    }
    createMutation.mutate(planData, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Plan created successfully",
        })
        router.push("/plans")
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to create plan",
          variant: "destructive",
        })
      },
    })
  }

  return (
    <>
      <PageHeader
        title="Create Plan"
        subtitle="Add a new subscription plan"
        breadcrumbs={[
          { label: "Plans & Subscriptions", href: "/plans" },
          { label: "Create Plan" },
        ]}
      />

      <GlassCard variant="default" className="max-w-4xl">
        <GlassCardHeader>
          <GlassCardTitle>Plan Information</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="planCode"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel required={req("planCode")}>Plan Code</RequiredLabel>
                      <FormControl>
                        <Input placeholder="Enter plan code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nameEn"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel required={req("nameEn")}>Name (English)</RequiredLabel>
                      <FormControl>
                        <Input placeholder="Enter plan name (English)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nameAr"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel required={req("nameAr")}>Name (Arabic)</RequiredLabel>
                      <FormControl>
                        <Input placeholder="Enter plan name (Arabic)" dir="rtl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="billingCycle"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel required={req("billingCycle")}>Billing Cycle</RequiredLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select billing cycle" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Monthly">Monthly</SelectItem>
                          <SelectItem value="Yearly">Yearly</SelectItem>
                          <SelectItem value="Both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currencyCode"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel required={req("currencyCode")}>Currency</RequiredLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  name="monthlyPrice"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel required={needsMonthly && req("monthlyPrice")}>Monthly Price</RequiredLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Enter monthly price"
                          className="no-spinner"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          disabled={!needsMonthly}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="yearlyPrice"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel required={needsYearly && req("yearlyPrice")}>Yearly Price</RequiredLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Enter yearly price"
                          className="no-spinner"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          disabled={!needsYearly}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxBranches"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel required={req("maxBranches")}>Max Branches</RequiredLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter max branches"
                          className="no-spinner"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxUsers"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel required={req("maxUsers")}>Max Users</RequiredLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter max users"
                          className="no-spinner"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="featuresJson"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <RequiredLabel required={req("featuresJson")}>Features (JSON)</RequiredLabel>
                      <FormControl>
                        <Textarea placeholder='e.g. ["Feature A","Feature B"]' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <RequiredLabel required={req("isActive")} className="text-base">
                          Active
                        </RequiredLabel>
                        <div className="text-sm text-muted-foreground">
                          Enable or disable this plan
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <RequiredLabel required={req("description")}>Description</RequiredLabel>
                      <FormControl>
                        <Textarea placeholder="Enter plan description (optional)" {...field} />
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
                <Button type="submit" size="lg" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </Form>
        </GlassCardContent>
      </GlassCard>
    </>
  )
}
