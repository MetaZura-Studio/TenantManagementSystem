"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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
  FormDescription,
} from "@/components/ui/form"
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/shared/cards"
import { PageHeader } from "@/components/shared/page-header"
import { toast } from "@/components/shared/feedback/use-toast"
import { RequiredLabel } from "@/components/shared/forms/RequiredLabel"
import { getCitiesByCountryName, getCountries } from "@/lib/geo/locations"
import { useCreateTenant, useTenants } from "../hooks"
import { buildTenantSchema } from "../schemas"
import type { Tenant } from "../types"
import { generateSlug, ensureUniqueSlug } from "@/lib/utils/slug"
import { z } from "zod"
import { useRequiredFieldsMatrix } from "@/features/settings/hooks"
import { isRequired } from "@/lib/forms/required-fields"

// Common timezones
const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Dubai",
  "Asia/Riyadh",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
]

export function CreateTenantPage() {
  const router = useRouter()
  const createMutation = useCreateTenant()
  const { data: existingTenants = [] } = useTenants()
  const { matrix } = useRequiredFieldsMatrix()
  const req = (field: string) => isRequired(matrix, "tenants", field, true)

  const formSchema = useMemo(
    () =>
      buildTenantSchema({
        required: (field) => isRequired(matrix, "tenants", field, true),
      }).omit({ slug: true }),
    [matrix]
  )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tenantCode: `T${Date.now().toString().slice(-6)}`,
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
      invoicePrefix: "ABC",
      timezone: "UTC",
      subscriptionStatus: "TRIAL",
    },
  })

  const selectedCountry = form.watch("country")
  const countryOptions = useMemo(() => getCountries(), [])
  const cityOptions = useMemo(
    () => getCitiesByCountryName(selectedCountry),
    [selectedCountry]
  )

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    // Generate slug from shopNameEn
    const slugSource = (data.shopNameEn || data.shopNameAr || data.tenantCode || "").trim()
    const baseSlug = generateSlug(slugSource || `tenant-${Date.now().toString().slice(-6)}`)
    const existingSlugs = existingTenants.map((t) => t.slug)
    const uniqueSlug = ensureUniqueSlug(baseSlug, existingSlugs)

    const tenantData: Omit<Tenant, "id" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy"> = {
      tenantCode: data.tenantCode ?? `T${Date.now().toString().slice(-6)}`,
      slug: uniqueSlug, // Auto-generated slug
      shopNameEn: data.shopNameEn ?? "",
      shopNameAr: data.shopNameAr ?? "",
      ownerName: data.ownerName ?? "",
      ownerEmail: data.ownerEmail ?? "",
      ownerMobile: data.ownerMobile ?? "",
      tenantType: (data.tenantType || "Individual") as Tenant["tenantType"],
      contactPerson: data.contactPerson ?? "",
      address: data.address ?? "",
      city: data.city ?? "",
      zipCode: data.zipCode ?? "",
      country: data.country ?? "",
      invoicePrefix: data.invoicePrefix,
      timezone: data.timezone ?? "UTC",
      subscriptionStatus: (data.subscriptionStatus || "TRIAL") as Tenant["subscriptionStatus"],
      subscriptionStartDate: data.subscriptionStartDate,
      subscriptionEndDate: data.subscriptionEndDate,
    }
    createMutation.mutate(
      { tenant: tenantData, logoFile: data.logo ?? null },
      {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Tenant created successfully",
        })
        router.push("/tenants")
      },
      onError: (err: any) => {
        toast({
          title: "Error",
          description: err?.message || "Failed to create tenant",
          variant: "destructive",
        })
      },
      }
    )
  }

  return (
    <>
      <PageHeader
        title="Create Tenant"
        subtitle="Add a new tenant to your system"
        breadcrumbs={[
          { label: "Tenant Management", href: "/tenants" },
          { label: "Create Tenant" },
        ]}
      />

      <GlassCard variant="default" className="max-w-4xl">
        <GlassCardHeader>
          <GlassCardTitle>Tenant Information</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Tenant Type - Radio buttons at top */}
              <FormField
                control={form.control}
                name="tenantType"
                render={({ field }) => (
                  <FormItem>
                    <RequiredLabel required={req("tenantType")}>Tenant Type</RequiredLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="flex items-center gap-6"
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="Individual" id="tenantType-individual" />
                          <Label htmlFor="tenantType-individual">Individual</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="Company" id="tenantType-company" />
                          <Label htmlFor="tenantType-company">Company</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Tenant Code */}
                <FormField
                  control={form.control}
                  name="tenantCode"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel required={req("tenantCode")}>Tenant Code</RequiredLabel>
                      <FormControl>
                        <Input placeholder="Enter tenant code" {...field} />
                      </FormControl>
                      <FormDescription>Unique business identifier</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Invoice Prefix */}
                <FormField
                  control={form.control}
                  name="invoicePrefix"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel required={req("invoicePrefix")}>Invoice Prefix</RequiredLabel>
                      <FormControl>
                        <Input placeholder="e.g., ABC" {...field} />
                      </FormControl>
                      <FormDescription>Used as the prefix for generated invoice codes.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Shop Name English */}
                <FormField
                  control={form.control}
                  name="shopNameEn"
                  render={({ field }) => {
                    const shopNameEn = form.watch("shopNameEn")
                    const generatedSlug = shopNameEn ? generateSlug(shopNameEn) : ""
                    const existingSlugs = existingTenants.map((t) => t.slug)
                    const previewSlug = generatedSlug ? ensureUniqueSlug(generatedSlug, existingSlugs) : ""

                    return (
                      <FormItem>
                        <RequiredLabel required={req("shopNameEn")}>Shop Name (English)</RequiredLabel>
                        <FormControl>
                          <Input placeholder="Enter shop name in English" {...field} />
                        </FormControl>
                        {previewSlug && (
                          <FormDescription>
                            Slug will be: <code className="text-xs bg-muted px-1 py-0.5 rounded">{previewSlug}</code>
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )
                  }}
                />

                {/* Shop Name Arabic */}
                <FormField
                  control={form.control}
                  name="shopNameAr"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel required={req("shopNameAr")}>Shop Name (Arabic)</RequiredLabel>
                      <FormControl>
                        <Input placeholder="Enter shop name in Arabic" {...field} dir="rtl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Owner Name */}
                <FormField
                  control={form.control}
                  name="ownerName"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel required={req("ownerName")}>Owner Name</RequiredLabel>
                      <FormControl>
                        <Input placeholder="Enter owner name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Owner Email */}
                <FormField
                  control={form.control}
                  name="ownerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel required={req("ownerEmail")}>Owner Email</RequiredLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter owner email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Owner Mobile */}
                <FormField
                  control={form.control}
                  name="ownerMobile"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel required={req("ownerMobile")}>Owner Mobile</RequiredLabel>
                      <FormControl>
                        <Input placeholder="Enter owner mobile" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tenant Logo */}
                <FormField
                  control={form.control}
                  name="logo"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <RequiredLabel required={req("logo")}>Tenant Logo</RequiredLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => field.onChange(e.target.files?.[0] ?? undefined)}
                        />
                      </FormControl>
                      {field.value ? (
                        <FormDescription>
                          Selected: <span className="text-xs">{field.value.name}</span>
                        </FormDescription>
                      ) : (
                        <FormDescription>Optional image upload for your tenant.</FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Contact Person */}
                <FormField
                  control={form.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel required={req("contactPerson")}>Contact Person</RequiredLabel>
                      <FormControl>
                        <Input placeholder="Enter contact person" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Address */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <RequiredLabel required={req("address")}>Address</RequiredLabel>
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
                      <RequiredLabel required={req("country")}>Country</RequiredLabel>
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

                {/* Zip Code */}
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel required={req("zipCode")}>Zip Code</RequiredLabel>
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
                      <RequiredLabel required={req("city")}>City</RequiredLabel>
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

                {/* Timezone */}
                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel required={req("timezone")}>Timezone</RequiredLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TIMEZONES.map((tz) => (
                            <SelectItem key={tz} value={tz}>
                              {tz}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Subscription Status */}
                <FormField
                  control={form.control}
                  name="subscriptionStatus"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel required={req("subscriptionStatus")}>Subscription Status</RequiredLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select subscription status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="TRIAL">TRIAL</SelectItem>
                          <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                          <SelectItem value="SUSPENDED">SUSPENDED</SelectItem>
                          <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                          <SelectItem value="EXPIRED">EXPIRED</SelectItem>
                        </SelectContent>
                      </Select>
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
