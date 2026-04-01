"use client"

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
import { userSchema } from "../schemas"
import { z } from "zod"

interface EditUserPageProps {
  userId: string
}

export function EditUserPage({ userId }: EditUserPageProps) {
  const router = useRouter()
  const { data: user, isLoading } = useUser(userId)
  const { data: tenants = [] } = useTenants()
  const { data: roles = [] } = useRoles()
  const updateMutation = useUpdateUser()

  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    values: user
      ? {
          username: user.username,
          password: "",
          email: user.email,
          mobile: user.mobile,
          fullNameEn: user.fullNameEn || "",
          fullNameAr: user.fullNameAr || "",
          tenantId: user.tenantId,
          branchId: user.branchId || "",
          roleId: user.roleId,
          status: user.status,
        }
      : undefined,
  })

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

  if (isLoading) {
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
                  name="fullNameEn"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>Full Name (EN)</RequiredLabel>
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
                      <RequiredLabel>Full Name (AR)</RequiredLabel>
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
                      <RequiredLabel>Tenant</RequiredLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
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
                  name="roleId"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>Role</RequiredLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
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
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
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
