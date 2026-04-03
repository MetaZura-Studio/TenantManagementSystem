"use client"

import { useEffect, useState } from "react"
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
} from "@/components/ui/form"
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/shared/cards"
import { PageHeader } from "@/components/shared/page-header"
import { toast } from "@/components/shared/feedback/use-toast"
import { RequiredLabel } from "@/components/shared/forms/RequiredLabel"
import { useUser, useUpdateUser } from "../hooks"
import { useTenants } from "@/features/tenants/hooks"
import { useRoles } from "@/features/roles/hooks"
import { buildUserSchema } from "../schemas"
import { z } from "zod"
import { useRequiredFieldsMatrix } from "@/features/settings/hooks"
import { isRequired } from "@/lib/forms/required-fields"
import { useMemo } from "react"

interface EditUserPageProps {
  userId: string
}

export function EditUserPage({ userId }: EditUserPageProps) {
  const router = useRouter()
  const { data: user, isLoading } = useUser(userId)
  const { data: tenants = [] } = useTenants()
  const { data: roles = [] } = useRoles()
  const updateMutation = useUpdateUser()
  const { matrix } = useRequiredFieldsMatrix()
  const [didInit, setDidInit] = useState(false)

  const userSchema = useMemo(
    () =>
      buildUserSchema({
        required: (field) => isRequired(matrix, "users", field, true),
      }),
    [matrix]
  )

  const req = useMemo(() => (field: string) => isRequired(matrix, "users", field, true), [matrix])

  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      mobile: "",
      fullNameEn: "",
      fullNameAr: "",
      tenantId: "",
      branchId: undefined,
      roleId: "",
      status: "ACTIVE",
      address: undefined,
      zipCode: undefined,
      country: undefined,
    },
  })

  useEffect(() => {
    // On navigation between users, ensure we re-initialize the form once per userId.
    setDidInit(false)
  }, [userId])

  useEffect(() => {
    if (!user) return

    form.reset({
      username: user.username,
      password: "",
      email: user.email,
      mobile: user.mobile,
      fullNameEn: user.fullNameEn || "",
      fullNameAr: user.fullNameAr || "",
      tenantId: user.tenantId != null ? String(user.tenantId) : "",
      branchId: user.branchId || undefined,
      roleId: user.roleId != null ? String(user.roleId) : "",
      status: user.status,
      address: user.address,
      zipCode: user.zipCode,
      country: user.country,
    })

    // Radix Select can keep showing placeholder if the value is not explicitly set after async load.
    // Force-set these fields to ensure the Select trigger renders the selected option.
    if (user.tenantId != null) {
      form.setValue("tenantId", String(user.tenantId), { shouldDirty: false, shouldValidate: true })
    }
    if (user.roleId != null) {
      form.setValue("roleId", String(user.roleId), { shouldDirty: false, shouldValidate: true })
    }
    if (user.status) {
      form.setValue("status", user.status, { shouldDirty: false, shouldValidate: true })
    }
    // Mark initialized after we’ve applied the saved values.
    setDidInit(true)
  }, [user, form])

  // Guard against async timing issues: ensure Select fields keep the saved IDs once option lists load.
  useEffect(() => {
    if (!user) return

    const currentTenantId = form.getValues("tenantId")
    const savedTenantId = user.tenantId != null ? String(user.tenantId) : ""
    if (!currentTenantId && savedTenantId) {
      form.setValue("tenantId", savedTenantId, { shouldDirty: false, shouldValidate: true })
    }

    const currentRoleId = form.getValues("roleId")
    const savedRoleId = user.roleId != null ? String(user.roleId) : ""
    if (!currentRoleId && savedRoleId) {
      form.setValue("roleId", savedRoleId, { shouldDirty: false, shouldValidate: true })
    }
  }, [user, tenants.length, roles.length, form])

  const onSubmit = (data: z.infer<typeof userSchema>) => {
    updateMutation.mutate(
      {
        id: userId,
        updates: {
          username: data.username,
          email: data.email,
          mobile: data.mobile,
          fullNameEn: data.fullNameEn || undefined,
          fullNameAr: data.fullNameAr || undefined,
          tenantId: data.tenantId,
          branchId: data.branchId || undefined,
          roleId: data.roleId,
          status: data.status,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "User updated successfully",
          })
          router.push(`/users/${userId}`)
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to update user",
            variant: "destructive",
          })
        },
      }
    )
  }

  if (isLoading || !didInit) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!user) {
    return <div className="text-center py-8">User not found</div>
  }

  return (
    <>
      <PageHeader
        title="Edit User"
        subtitle={user.username}
        breadcrumbs={[
          { label: "Users", href: "/users" },
          { label: "User Details", href: `/users/${userId}` },
          { label: "Edit User" },
        ]}
      />

      <GlassCard variant="default" className="max-w-4xl">
        <GlassCardHeader>
          <GlassCardTitle>User Information</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel required={req("username")}>Username</RequiredLabel>
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
                      <RequiredLabel required={req("email")}>Email</RequiredLabel>
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
                      <RequiredLabel required={req("mobile")}>Mobile</RequiredLabel>
                      <FormControl>
                        <Input placeholder="Enter mobile number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fullNameEn"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel required={req("fullNameEn")}>Full Name (EN)</RequiredLabel>
                      <FormControl>
                        <Input placeholder="Enter full name (English)" {...field} />
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
                      <RequiredLabel required={req("fullNameAr")}>Full Name (AR)</RequiredLabel>
                      <FormControl>
                        <Input placeholder="Enter full name (Arabic)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tenantId"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel required={req("tenantId")}>Tenant</RequiredLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <FormControl>
                          <SelectTrigger>
                            <span className={field.value ? "" : "text-muted-foreground"}>
                              {field.value
                                ? tenants.find((t) => String(t.id) === String(field.value))?.shopNameEn ??
                                  `Tenant ID: ${String(field.value)}`
                                : "Select tenant"}
                            </span>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {field.value && !tenants.some((t) => String(t.id) === String(field.value)) ? (
                            <SelectItem key={`current-tenant-${field.value}`} value={String(field.value)}>
                              Current Tenant (ID: {String(field.value)})
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
                  name="roleId"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel required={req("roleId")}>Role</RequiredLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <FormControl>
                          <SelectTrigger>
                            <span className={field.value ? "" : "text-muted-foreground"}>
                              {field.value
                                ? roles.find((r) => String(r.id) === String(field.value))?.roleName ??
                                  `Role ID: ${String(field.value)}`
                                : "Select role"}
                            </span>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {field.value && !roles.some((r) => String(r.id) === String(field.value)) ? (
                            <SelectItem key={`current-role-${field.value}`} value={String(field.value)}>
                              Current Role (ID: {String(field.value)})
                            </SelectItem>
                          ) : null}
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
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel required={req("status")}>Status</RequiredLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? "ACTIVE"}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="INACTIVE">Inactive</SelectItem>
                          <SelectItem value="LOCKED">Locked</SelectItem>
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
