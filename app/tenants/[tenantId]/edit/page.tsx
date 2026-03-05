"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { AppShell } from "@/components/app-shell"
import { PageHeaderV2 } from "@/components/page-header-v2"
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/glass-card"
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
import { toast } from "@/hooks/use-toast"
import { tenantsApi } from "@/lib/api"
import { tenantSchema } from "@/lib/schemas"
import type { Tenant } from "@/lib/types"
import { z } from "zod"

const formSchema = tenantSchema.extend({
  tenantId: z.string().min(1, "Tenant ID is required"),
})

export default function EditTenantPage({
  params,
}: {
  params: Promise<{ tenantId: string }>
}) {
  const { tenantId } = use(params)
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: tenant, isLoading } = useQuery({
    queryKey: ["tenants", tenantId],
    queryFn: () => tenantsApi.getById(tenantId),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: tenant
      ? {
          tenantId: tenant.tenantId,
          tenantName: tenant.tenantName,
          contactPerson: tenant.contactPerson,
          email: tenant.email,
          phone: tenant.phone,
          address: tenant.address,
          city: tenant.city,
          state: tenant.state,
          zipCode: tenant.zipCode,
          country: tenant.country,
          status: tenant.status,
          ownerName: tenant.ownerName,
          ownerEmail: tenant.ownerEmail,
          ownerPhone: tenant.ownerPhone,
          ownerType: tenant.ownerType,
          remarks: tenant.remarks,
        }
      : undefined,
  })

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      return tenantsApi.update(tenantId, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] })
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
  })

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    mutation.mutate(data)
  }

  if (isLoading) {
    return (
      <AppShell>
        <div className="text-center py-8">Loading...</div>
      </AppShell>
    )
  }

  if (!tenant) {
    return (
      <AppShell>
        <div className="text-center py-8">Tenant not found</div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <PageHeaderV2
        title="Edit Tenant"
        subtitle={tenant.tenantName}
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
              name="tenantName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tenant Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter tenant name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactPerson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Person</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter contact person" {...field} />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter email" {...field} />
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
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter phone" {...field} />
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
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter address" {...field} />
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
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter city" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter state" {...field} />
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
                    <Input placeholder="Enter zip code" {...field} />
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
                  <FormControl>
                    <Input placeholder="Enter country" {...field} />
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
                <Button type="submit" size="lg">Save</Button>
              </div>
            </form>
          </Form>
        </GlassCardContent>
      </GlassCard>
    </AppShell>
  )
}
