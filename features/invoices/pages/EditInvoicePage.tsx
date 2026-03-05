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
import { useInvoice, useUpdateInvoice } from "../hooks"
import { useTenants } from "@/features/tenants/hooks"
import { useSubscriptions } from "@/features/tenant-subscriptions/hooks"
import { invoiceSchema } from "../schemas"
import { z } from "zod"

interface EditInvoicePageProps {
  invoiceId: string
}

export function EditInvoicePage({ invoiceId }: EditInvoicePageProps) {
  const router = useRouter()
  const { data: invoice, isLoading } = useInvoice(invoiceId)
  const { data: tenants = [] } = useTenants()
  const { data: subscriptions = [] } = useSubscriptions()
  const updateMutation = useUpdateInvoice()

  const form = useForm<z.infer<typeof invoiceSchema>>({
    resolver: zodResolver(invoiceSchema),
    values: invoice
      ? {
          tenantId: invoice.tenantId,
          subscriptionId: invoice.subscriptionId,
          periodStart: invoice.periodStart,
          periodEnd: invoice.periodEnd,
          issueDate: invoice.issueDate,
          dueDate: invoice.dueDate,
          currency: invoice.currency,
          notes: invoice.notes || "",
        }
      : undefined,
  })

  const onSubmit = (data: z.infer<typeof invoiceSchema>) => {
    updateMutation.mutate(
      {
        id: invoiceId,
        updates: {
          tenantId: data.tenantId,
          subscriptionId: data.subscriptionId,
          periodStart: data.periodStart,
          periodEnd: data.periodEnd,
          issueDate: data.issueDate,
          dueDate: data.dueDate,
          currency: data.currency,
          notes: data.notes || undefined,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Invoice updated successfully",
          })
          router.push(`/invoices/${invoiceId}`)
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to update invoice",
            variant: "destructive",
          })
        },
      }
    )
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!invoice) {
    return <div className="text-center py-8">Invoice not found</div>
  }

  return (
    <>
      <PageHeader
        title="Edit Invoice"
        subtitle={invoice.invoiceNumber}
        breadcrumbs={[
          { label: "Invoice Management", href: "/invoices" },
          { label: "Invoice Details", href: `/invoices/${invoiceId}` },
          { label: "Edit Invoice" },
        ]}
      />

      <GlassCard variant="default" className="max-w-4xl">
        <GlassCardHeader>
          <GlassCardTitle>Invoice Information</GlassCardTitle>
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
                      <FormLabel>Tenant</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select tenant" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tenants.map((tenant) => (
                            <SelectItem key={tenant.id} value={tenant.id}>
                              {tenant.tenantName}
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
                  name="subscriptionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subscription</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select subscription" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subscriptions.map((sub) => (
                            <SelectItem key={sub.id} value={sub.id}>
                              {sub.subscriptionId}
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
                  name="periodStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Period Start</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="periodEnd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Period End</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="issueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issue Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter currency code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter notes (optional)" {...field} />
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
