"use client"

import { useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
  FormDescription,
} from "@/components/ui/form"
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/shared/cards"
import { PageHeader } from "@/components/shared/page-header"
import { toast } from "@/components/shared/feedback/use-toast"
import { RequiredLabel } from "@/components/shared/forms/RequiredLabel"
import {
  getCitiesByCountryAndStateName,
  getCountries,
  getStatesByCountryName,
} from "@/lib/geo/locations"
import { useCreateBranch } from "../hooks"
import { useTenants } from "@/features/tenants/hooks"
import { branchSchema } from "../schemas"
import type { Branch } from "../types"
import { z } from "zod"

const formSchema = branchSchema.omit({ status: true })

export function CreateBranchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tenantIdFromUrl = searchParams.get("tenantId")
  const lockTenant = Boolean(tenantIdFromUrl)
  const createMutation = useCreateBranch()
  const { data: tenants = [] } = useTenants()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tenantId: tenantIdFromUrl ?? "",
      branchCode: `BR${Date.now().toString().slice(-6)}`,
      nameEn: "",
      nameAr: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      phone: "",
      contactName: "",
      remarks: "",
    },
  })

  const selectedCountry = form.watch("country")
  const selectedState = form.watch("state")

  const countryOptions = useMemo(() => getCountries(), [])
  const stateOptions = useMemo(
    () => getStatesByCountryName(selectedCountry),
    [selectedCountry]
  )
  const cityOptions = useMemo(
    () => getCitiesByCountryAndStateName(selectedCountry, selectedState),
    [selectedCountry, selectedState]
  )

  useEffect(() => {
    if (!tenantIdFromUrl) return
    // Pre-fill tenant if coming from a tenant context.
    const current = form.getValues("tenantId")
    if (String(current || "") !== String(tenantIdFromUrl)) {
      form.setValue("tenantId", String(tenantIdFromUrl), {
        shouldValidate: true,
        shouldDirty: true,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantIdFromUrl])

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const branchData: Omit<Branch, "id" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy"> = {
      tenantId: data.tenantId,
      branchCode: data.branchCode,
      nameEn: data.nameEn,
      nameAr: data.nameAr,
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      country: data.country,
      phone: data.phone,
      contactName: data.contactName,
      status: "ACTIVE", // Default to ACTIVE for new branches
      remarks: data.remarks,
    }
    createMutation.mutate(branchData, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Branch created successfully",
        })
        router.push("/branches")
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to create branch",
          variant: "destructive",
        })
      },
    })
  }

  return (
    <>
      <PageHeader
        title="Create Branch"
        subtitle="Add a new branch"
        breadcrumbs={[
          { label: "Tenant Management", href: "/tenants" },
          { label: "Branches", href: "/branches" },
          { label: "Create Branch" },
        ]}
      />

      <GlassCard variant="default" className="max-w-4xl">
        <GlassCardHeader>
          <GlassCardTitle>Branch Information</GlassCardTitle>
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
                      <RequiredLabel>Tenant</RequiredLabel>
                      <Select
                        onValueChange={lockTenant ? () => {} : field.onChange}
                        value={field.value ?? ""}
                        disabled={lockTenant}
                      >
                        <FormControl>
                          <SelectTrigger disabled={lockTenant}>
                            {field.value ? (
                              <span className="truncate">
                                {tenants.find((t) => t.id === field.value)?.shopNameEn ||
                                  `Tenant (${field.value})`}
                              </span>
                            ) : (
                              <SelectValue placeholder="Select tenant" />
                            )}
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {field.value && !tenants.some((t) => t.id === field.value) ? (
                            <SelectItem key={`selected-${field.value}`} value={field.value}>
                              {`Selected tenant (${field.value})`}
                            </SelectItem>
                          ) : null}
                          {tenants.map((tenant) => (
                            <SelectItem key={tenant.id} value={tenant.id}>
                              {tenant.shopNameEn}
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
                  name="branchCode"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>Branch Code</RequiredLabel>
                      <FormControl>
                        <Input placeholder="Enter branch code" {...field} />
                      </FormControl>
                      <FormDescription>Unique branch identifier</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nameEn"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>Branch Name (English)</RequiredLabel>
                      <FormControl>
                        <Input placeholder="Enter branch name in English" {...field} />
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
                      <RequiredLabel>Branch Name (Arabic)</RequiredLabel>
                      <FormControl>
                        <Input placeholder="Enter branch name in Arabic" {...field} dir="rtl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
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
                          form.setValue("state", "", { shouldDirty: true, shouldValidate: true })
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
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>State</RequiredLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value)
                          form.setValue("city", "", { shouldDirty: true, shouldValidate: true })
                        }}
                        value={field.value ?? ""}
                        disabled={!selectedCountry}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={selectedCountry ? "Select state" : "Select country first"}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {stateOptions.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
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
                        disabled={!selectedCountry || !selectedState}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                selectedCountry && selectedState
                                  ? "Select city"
                                  : "Select country and state first"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>Phone</RequiredLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>Contact Name</RequiredLabel>
                      <FormControl>
                        <Input placeholder="Enter contact name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="remarks"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Remarks</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter remarks (optional)" {...field} />
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
