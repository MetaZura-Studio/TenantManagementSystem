"use client"

import { useState } from "react"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { useCreateInvoice } from "../hooks"
import { useTenants } from "@/features/tenants/hooks"
import { useSubscriptions } from "@/features/tenant-subscriptions/hooks"
import { useCurrencies } from "@/features/currency/hooks"
import { invoiceSchema } from "../schemas"
import type { Invoice } from "../types"
import { z } from "zod"
import { Mail, MessageCircle } from "lucide-react"

export function CreateInvoicePage() {
  const router = useRouter()
  const createMutation = useCreateInvoice()
  const { data: tenants = [] } = useTenants()
  const { data: subscriptions = [] } = useSubscriptions()
  const { data: currencies = [] } = useCurrencies()
  const [sendDialogOpen, setSendDialogOpen] = useState(false)
  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null)

  const form = useForm<z.infer<typeof invoiceSchema>>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      tenantId: "",
      subscriptionId: "",
      invoiceSequence: "001",
      invoiceNumber: Date.now().toString().slice(-6),
      periodStart: new Date().toISOString().split("T")[0],
      periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      currency: "USD",
      notes: "",
    },
  })

  const onSubmit = (data: z.infer<typeof invoiceSchema>) => {
    const fullInvoiceNumber = `${data.invoiceSequence}${data.invoiceNumber}`
    const invoiceData: Omit<Invoice, "id" | "createdAt" | "updatedAt"> = {
      invoiceId: `INV-${fullInvoiceNumber}`,
      invoiceNumber: `INV-${fullInvoiceNumber}`,
      tenantId: data.tenantId,
      subscriptionId: data.subscriptionId,
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      currency: data.currency,
      subtotal: 0,
      discount: 0,
      tax: 0,
      total: 0,
      amountPaid: 0,
      amountDue: 0,
      status: "ISSUED",
      notes: data.notes || undefined,
    }
    createMutation.mutate(invoiceData, {
      onSuccess: (invoice) => {
        setCreatedInvoice(invoice)
        setSendDialogOpen(true)
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to create invoice",
          variant: "destructive",
        })
      },
    })
  }

  const handleSendViaEmail = () => {
    if (!createdInvoice) return
    // TODO: Implement email sending logic
    toast({
      title: "Email Sent",
      description: `Invoice ${createdInvoice.invoiceNumber} sent via email as PDF`,
    })
    setSendDialogOpen(false)
    router.push("/invoices")
  }

  const handleSendViaWhatsApp = () => {
    if (!createdInvoice) return
    // TODO: Implement WhatsApp sending logic
    toast({
      title: "WhatsApp Message Sent",
      description: `Invoice ${createdInvoice.invoiceNumber} sent via WhatsApp as PDF`,
    })
    setSendDialogOpen(false)
    router.push("/invoices")
  }

  return (
    <>
      <PageHeader
        title="Create Invoice"
        subtitle="Add a new invoice"
        breadcrumbs={[
          { label: "Invoice Management", href: "/invoices" },
          { label: "Create Invoice" },
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  name="invoiceSequence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Sequence (3 digits)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="001"
                          maxLength={3}
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "").slice(0, 3)
                            field.onChange(value)
                          }}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">
                        Enter 3 digits that will prefix the invoice number
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter invoice number"
                          {...field}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">
                        Enter the invoice number (will be combined with sequence)
                      </p>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currencies.map((c) => (
                            <SelectItem key={c.id} value={c.currencyCode}>
                              {c.currencyCode} - {c.currencyName}
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
                <Button type="submit" size="lg" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Send Invoice"}
                </Button>
              </div>
            </form>
          </Form>
        </GlassCardContent>
      </GlassCard>

      {/* Send Invoice Dialog */}
      <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Invoice</DialogTitle>
            <DialogDescription>
              Choose how you want to send invoice {createdInvoice?.invoiceNumber} to the tenant.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-4">
            <Button
              onClick={handleSendViaEmail}
              variant="outline"
              className="w-full justify-start h-auto py-4"
            >
              <Mail className="mr-3 h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Send via Email</div>
                <div className="text-sm text-muted-foreground">Send invoice as PDF attachment via email</div>
              </div>
            </Button>
            <Button
              onClick={handleSendViaWhatsApp}
              variant="outline"
              className="w-full justify-start h-auto py-4"
            >
              <MessageCircle className="mr-3 h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Send via WhatsApp</div>
                <div className="text-sm text-muted-foreground">Send invoice as PDF via WhatsApp</div>
              </div>
            </Button>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSendDialogOpen(false)
                router.push("/invoices")
              }}
            >
              Skip for Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
