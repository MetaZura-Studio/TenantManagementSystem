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
import {
  getCitiesByCountryAndStateName,
  getCountries,
  getStatesByCountryName,
} from "@/lib/geo/locations"
import { useBranch, useUpdateBranch } from "../hooks"
import { useTenants } from "@/features/tenants/hooks"
import { branchSchema } from "../schemas"
import { z } from "zod"

interface EditBranchPageProps {
  branchId: string
}

export function EditBranchPage({ branchId }: EditBranchPageProps) {
  const router = useRouter()
  const { data: branch, isLoading } = useBranch(branchId)
  const { data: tenants = [] } = useTenants()
  const updateMutation = useUpdateBranch()

  const form = useForm<z.infer<typeof branchSchema>>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      tenantId: "",
      branchCode: "",
      nameEn: "",
      nameAr: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      phone: "",
      contactName: "",
      status: "ACTIVE",
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
    if (!branch) return
    form.reset({
      tenantId: branch.tenantId,
      branchCode: branch.branchCode,
      nameEn: branch.nameEn,
      nameAr: branch.nameAr,
      address: branch.address,
      city: branch.city,
      state: branch.state,
      zipCode: branch.zipCode,
      country: branch.country,
      phone: branch.phone,
      contactName: branch.contactName,
      status: branch.status,
      remarks: branch.remarks ?? "",
    })
  }, [branch, form])

  const onSubmit = (data: z.infer<typeof branchSchema>) => {
    updateMutation.mutate(
      { id: branchId, updates: data },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Branch updated successfully",
          })
          router.push("/branches")
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to update branch",
            variant: "destructive",
          })
        },
      }
    )
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!branch) {
    return <div className="text-center py-8">Branch not found</div>
  }

  return (
    <>
      <PageHeader
        title="Edit Branch"
        subtitle={branch.nameEn}
        breadcrumbs={[
          { label: "Tenant Management", href: "/tenants" },
          { label: "Branches", href: "/branches" },
          { label: "Edit Branch" },
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
                        key={`${tenants.length}-${field.value || ""}`}
                        onValueChange={field.onChange}
                        value={field.value ?? ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select tenant" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nameEn"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>Branch Name (EN)</RequiredLabel>
                      <FormControl>
                        <Input placeholder="Enter branch name (English)" {...field} />
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
                      <RequiredLabel>Branch Name (AR)</RequiredLabel>
                      <FormControl>
                        <Input placeholder="Enter branch name (Arabic)" {...field} />
                      </FormControl>
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
                        <Input placeholder="Enter phone" {...field} />
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
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>Status</RequiredLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="INACTIVE">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
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
