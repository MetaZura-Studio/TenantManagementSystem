"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
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

export default function CreateTenantPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tenantId: `T${Date.now().toString().slice(-4)}`,
      tenantName: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      status: "Active",
      ownerName: "",
      ownerEmail: "",
      ownerPhone: "",
      ownerType: "Indv",
      remarks: "",
    },
  })

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const tenantData: Omit<Tenant, "id" | "createdAt" | "updatedAt"> = {
        tenantId: data.tenantId,
        tenantName: data.tenantName,
        contactPerson: data.contactPerson,
        email: data.email,
        phone: data.phone,
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        zipCode: data.zipCode || "",
        country: data.country || "",
        status: data.status,
        subscriptionStatus: "Pending",
        ownerName: data.ownerName,
        ownerEmail: data.ownerEmail,
        ownerPhone: data.ownerPhone,
        ownerType: data.ownerType,
        remarks: data.remarks,
      }
      return tenantsApi.create(tenantData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] })
      toast({
        title: "Success",
        description: "Tenant created successfully",
      })
      router.push("/tenants")
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create tenant",
        variant: "destructive",
      })
    },
  })

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    mutation.mutate(data)
  }

  return (
    <AppShell>
      <PageHeaderV2
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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="tenantId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tenant ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter tenant ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
              name="ownerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Owner Name</FormLabel>
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
                  <FormLabel>Owner Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter owner email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ownerPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Owner Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter owner phone" {...field} />
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              name="ownerType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Owner Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select owner type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Indv">Indv</SelectItem>
                      <SelectItem value="Company">Company</SelectItem>
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
                    <Textarea placeholder="Enter remarks" {...field} />
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
                <Button type="submit" size="lg">Save</Button>
              </div>
            </form>
          </Form>
        </GlassCardContent>
      </GlassCard>
    </AppShell>
  )
}
