"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { getCountries } from "@/lib/geo/locations"
import { useCreateUser } from "../hooks"
import { useTenants } from "@/features/tenants/hooks"
import { useBranches } from "@/features/branches/hooks"
import { useRoles } from "@/features/roles/hooks"
import { userSchema } from "../schemas"
import type { User } from "../types"
import { z } from "zod"

const formSchema = userSchema.omit({ status: true })
const MAIN_BRANCH_VALUE = "__MAIN__"

export function CreateUserPage() {
  const router = useRouter()
  const createMutation = useCreateUser()
  const { data: tenants = [] } = useTenants()
  const { data: branches = [] } = useBranches()
  const { data: roles = [] } = useRoles()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tenantId: "",
      branchId: "",
      roleId: "",
      fullNameEn: "",
      fullNameAr: "",
      username: "",
      email: "",
      mobile: "",
      password: "",
      address: "",
      zipCode: "",
      country: "",
    },
  })

  const countryOptions = useMemo(() => getCountries(), [])

  // Filter branches based on selected tenant
  const selectedTenantId = form.watch("tenantId")
  const availableBranches = selectedTenantId
    ? branches.filter((b) => b.tenantId === selectedTenantId)
    : []

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const userData: Omit<User, "id" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy"> & {
      password: string
    } = {
      tenantId: data.tenantId,
      branchId: data.branchId === MAIN_BRANCH_VALUE ? undefined : (data.branchId || undefined),
      roleId: data.roleId,
      fullNameEn: data.fullNameEn,
      fullNameAr: data.fullNameAr,
      username: data.username,
      email: data.email,
      mobile: data.mobile,
      password: data.password || "",
      status: "ACTIVE", // Default to ACTIVE for new users
      address: data.address,
      zipCode: data.zipCode,
      country: data.country,
    }
    createMutation.mutate(userData, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "User created successfully",
        })
        router.push("/users")
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to create user",
          variant: "destructive",
        })
      },
    })
  }

  return (
    <>
      <PageHeader
        title="Create User"
        subtitle="Add a new user to the system"
        breadcrumbs={[
          { label: "Users", href: "/users" },
          { label: "Create User" },
        ]}
      />

      <GlassCard variant="default" className="max-w-4xl">
        <GlassCardHeader>
          <GlassCardTitle>User Information</GlassCardTitle>
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
                    <RequiredLabel>Tenant</RequiredLabel>
                    <Select onValueChange={(value) => {
                      field.onChange(value)
                      form.setValue("branchId", "") // Reset branch when tenant changes
                    }} defaultValue={field.value}>
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

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="branchId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={!selectedTenantId}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={selectedTenantId ? "Select branch" : "Select tenant first"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={MAIN_BRANCH_VALUE}>
                            Main branch (no specific branch)
                          </SelectItem>
                          {availableBranches.map((branch) => (
                            <SelectItem key={branch.id} value={branch.id}>
                              {branch.nameEn}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedTenantId && availableBranches.length === 0 && (
                        <FormDescription>
                          This tenant has no branches yet. Select “Main branch” to continue.
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="roleId"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>Role</RequiredLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.roleName}
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
                  name="fullNameEn"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>Full Name (English)</RequiredLabel>
                      <FormControl>
                        <Input placeholder="Enter full name in English" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fullNameAr"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>Full Name (Arabic)</RequiredLabel>
                      <FormControl>
                        <Input placeholder="Enter full name in Arabic" {...field} dir="rtl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>Username</RequiredLabel>
                      <FormControl>
                        <Input placeholder="Enter username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>Email</RequiredLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>Mobile</RequiredLabel>
                      <FormControl>
                        <Input placeholder="Enter mobile number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>Password</RequiredLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter password" {...field} />
                      </FormControl>
                      <FormDescription>Minimum 6 characters</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter address (optional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zip Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter zip code (optional)" {...field} />
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
                      <FormLabel>Country</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country (optional)" />
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
