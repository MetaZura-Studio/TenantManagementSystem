"use client"

import { useEffect, useMemo } from "react"
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
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/shared/cards"
import { PageHeader } from "@/components/shared/page-header"
import { toast } from "@/components/shared/feedback/use-toast"
import { RequiredLabel } from "@/components/shared/forms/RequiredLabel"
import { getCitiesByCountryName, getCountries } from "@/lib/geo/locations"
import { useTenant, useUpdateTenant } from "../hooks"
import { tenantSchema } from "../schemas"
import { z } from "zod"

const formSchema = tenantSchema

interface EditTenantPageProps {
  tenantId: string
}

export function EditTenantPage({ tenantId }: EditTenantPageProps) {
  const router = useRouter()
  const { data: tenant, isLoading } = useTenant(tenantId)
  const updateMutation = useUpdateTenant()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tenantCode: "",
      slug: "",
      shopNameEn: "",
      shopNameAr: "",
      ownerName: "",
      ownerEmail: "",
      ownerMobile: "",
      tenantType: "Individual",
      contactPerson: "",
      address: "",
      city: "",
      zipCode: "",
      country: "",
      timezone: "UTC",
      subscriptionStatus: "TRIAL",
      subscriptionStartDate: "",
      subscriptionEndDate: "",
      lockedAt: "",
      suspensionReason: "",
    },
  })

  const selectedCountry = form.watch("country")
  const countryOptions = useMemo(() => getCountries(), [])
  const cityOptions = useMemo(
    () => getCitiesByCountryName(selectedCountry),
    [selectedCountry]
  )

  useEffect(() => {
    if (!tenant) return
    form.reset({
      tenantCode: tenant.tenantCode,
      slug: tenant.slug,
      shopNameEn: tenant.shopNameEn,
      shopNameAr: tenant.shopNameAr,
      ownerName: tenant.ownerName,
      ownerEmail: tenant.ownerEmail,
      ownerMobile: tenant.ownerMobile,
      tenantType: tenant.tenantType,
      contactPerson: tenant.contactPerson,
      address: tenant.address,
      city: tenant.city,
      zipCode: tenant.zipCode,
      country: tenant.country,
      timezone: tenant.timezone,
      subscriptionStatus: tenant.subscriptionStatus,
      subscriptionStartDate: tenant.subscriptionStartDate ?? "",
      subscriptionEndDate: tenant.subscriptionEndDate ?? "",
      lockedAt: tenant.lockedAt ?? "",
      suspensionReason: tenant.suspensionReason ?? "",
    })
  }, [tenant, form])

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    updateMutation.mutate(
      { id: tenantId, updates: data },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Tenant updated successfully",
          })
          router.push(`/tenants/${tenantId}`)
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to update tenant",
            variant: "destructive",
          })
        },
      }
    )
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!tenant) {
    return <div className="text-center py-8">Tenant not found</div>
  }

  return (
    <>
      <PageHeader
        title="Edit Tenant"
        subtitle={tenant.shopNameEn}
        breadcrumbs={[
          { label: "Tenant Management", href: "/tenants" },
          { label: "Tenants List", href: "/tenants" },
          { label: "Edit Tenant" },
        ]}
      />

      <GlassCard variant="default" className="max-w-4xl">
        <GlassCardHeader>
          <GlassCardTitle>Tenant Information</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
                <FormField
                  control={form.control}
                  name="tenantCode"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>Tenant Code</RequiredLabel>
                      <FormControl>
                        <Input placeholder="Enter tenant code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shopNameEn"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>Shop Name (EN)</RequiredLabel>
                      <FormControl>
                        <Input placeholder="Enter shop name (English)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shopNameAr"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>Shop Name (AR)</RequiredLabel>
                      <FormControl>
                        <Input placeholder="Enter shop name (Arabic)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ownerName"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>Owner Name</RequiredLabel>
                      <FormControl>
                        <Input placeholder="Enter owner name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ownerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>Owner Email</RequiredLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter owner email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ownerMobile"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>Owner Mobile</RequiredLabel>
                      <FormControl>
                        <Input placeholder="Enter owner mobile" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tenantType"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>Tenant Type</RequiredLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select tenant type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Individual">Individual</SelectItem>
                          <SelectItem value="Company">Company</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>Contact Person</RequiredLabel>
                      <FormControl>
                        <Input placeholder="Enter contact person" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>Address</RequiredLabel>
                      <FormControl>
                        <Input placeholder="Enter address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>Country</RequiredLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value)
                          form.setValue("city", "", { shouldDirty: true, shouldValidate: true })
                        }}
                        value={field.value ?? ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder="Select country"
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countryOptions.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
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
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>Zip Code</RequiredLabel>
                      <FormControl>
                        <Input placeholder="Enter zip code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>City</RequiredLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ""}
                        disabled={!selectedCountry}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={selectedCountry ? "Select city" : "Select country first"}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {field.value && !cityOptions.some((c) => c.value === field.value) ? (
                            <SelectItem key={`selected-city-${field.value}`} value={field.value}>
                              {field.value}
                            </SelectItem>
                          ) : null}
                          {cityOptions.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
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
                  name="timezone"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>Timezone</RequiredLabel>
                      <FormControl>
                        <Input placeholder="Enter timezone" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subscriptionStatus"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>Subscription Status</RequiredLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select subscription status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="TRIAL">Trial</SelectItem>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="SUSPENDED">Suspended</SelectItem>
                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                          <SelectItem value="EXPIRED">Expired</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subscriptionStartDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subscription Start Date</FormLabel>
                      <FormControl>
                        <Input placeholder="YYYY-MM-DD" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subscriptionEndDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subscription End Date</FormLabel>
                      <FormControl>
                        <Input placeholder="YYYY-MM-DD" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="suspensionReason"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Suspension Reason</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter suspension reason (optional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/30 md:col-span-2">
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
