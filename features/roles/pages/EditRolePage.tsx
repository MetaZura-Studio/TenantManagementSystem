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
import { Checkbox } from "@/components/ui/checkbox"
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
import { useRole, useUpdateRole } from "../hooks"
import { roleSchema } from "../schemas"
import { z } from "zod"

const MODULES = [
  "Dashboard",
  "Tenants",
  "Branches",
  "Plans",
  "Subscriptions",
  "Users",
  "Roles",
  "Invoices",
  "Payments",
  "Currency",
  "Settings",
]

interface EditRolePageProps {
  roleId: string
}

export function EditRolePage({ roleId }: EditRolePageProps) {
  const router = useRouter()
  const { data: role, isLoading } = useRole(roleId)
  const updateMutation = useUpdateRole()

  // Merge existing permissions with all modules
  const getPermissions = () => {
    if (!role) return MODULES.map((module) => ({ module, view: false, create: false, edit: false, delete: false }))
    
    const existingPermissions = role.permissions || []
    return MODULES.map((module) => {
      const existing = existingPermissions.find((p) => p.module === module)
      return existing || { module, view: false, create: false, edit: false, delete: false }
    })
  }

  const form = useForm<z.infer<typeof roleSchema>>({
    resolver: zodResolver(roleSchema),
    values: role
      ? {
          roleName: role.roleName,
          description: role.description || "",
          status: role.status,
          permissions: getPermissions(),
        }
      : undefined,
  })

  const onSubmit = (data: z.infer<typeof roleSchema>) => {
    updateMutation.mutate(
      {
        id: roleId,
        updates: {
          roleName: data.roleName,
          description: data.description || undefined,
          status: data.status,
          permissions: data.permissions,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Role updated successfully",
          })
          router.push(`/roles/${roleId}`)
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to update role",
            variant: "destructive",
          })
        },
      }
    )
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!role) {
    return <div className="text-center py-8">Role not found</div>
  }

  return (
    <>
      <PageHeader
        title="Edit Role"
        subtitle={role.roleName}
        breadcrumbs={[
          { label: "Roles", href: "/roles" },
          { label: "Role Details", href: `/roles/${roleId}` },
          { label: "Edit Role" },
        ]}
      />

      <GlassCard variant="default" className="max-w-4xl">
        <GlassCardHeader>
          <GlassCardTitle>Role Information</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="roleName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter role name" {...field} />
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
                      <FormLabel>Status</FormLabel>
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

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter description (optional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4 pt-4 border-t border-border/30">
                <h3 className="text-lg font-semibold">Permissions</h3>
                <div className="space-y-4">
                  {MODULES.map((module, index) => (
                    <FormField
                      key={module}
                      control={form.control}
                      name={`permissions.${index}`}
                      render={() => (
                        <FormItem>
                          <div className="flex items-center space-x-4">
                            <div className="w-32 font-medium">{module}</div>
                            <FormField
                              control={form.control}
                              name={`permissions.${index}.view`}
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-2">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm">View</FormLabel>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`permissions.${index}.create`}
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-2">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm">Create</FormLabel>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`permissions.${index}.edit`}
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-2">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm">Edit</FormLabel>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`permissions.${index}.delete`}
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-2">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm">Delete</FormLabel>
                                </FormItem>
                              )}
                            />
                          </div>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
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
