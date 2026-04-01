"use client"

import { useMemo, useState } from "react"
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
import type { Invoice } from "../types"
import { z } from "zod"
import { Mail, MessageCircle } from "lucide-react"

const createInvoiceSchema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  subscriptionId: z.string().min(1, "Subscription is required"),
  periodStart: z.string().min(1, "Period start is required"),
  periodEnd: z.string().min(1, "Period end is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  currencyCode: z.string().min(1, "Currency is required"),
  notes: z.string().optional(),
})

export function CreateInvoicePage() {
  const router = useRouter()
  const createMutation = useCreateInvoice()
  const { data: tenants = [] } = useTenants()
  const { data: subscriptions = [] } = useSubscriptions()
  const { data: currencies = [] } = useCurrencies()
  const [sendDialogOpen, setSendDialogOpen] = useState(false)
  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null)

  const form = useForm<z.infer<typeof createInvoiceSchema>>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      tenantId: "",
      subscriptionId: "",
      periodStart: new Date().toISOString().split("T")[0],
      periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      currencyCode: "USD",
      notes: "",
    },
  })

  const nextInvoiceCode = useMemo(() => `INV-${Date.now().toString().slice(-8)}`, [])

  const onSubmit = (data: z.infer<typeof createInvoiceSchema>) => {
    const invoiceData: Omit<Invoice, "id" | "createdAt" | "updatedAt"> = {
      invoiceCode: nextInvoiceCode,
      tenantId: data.tenantId,
      subscriptionId: data.subscriptionId,
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      currencyCode: data.currencyCode,
      totalAmount: 0,
      taxAmount: 0,
      discountAmount: 0,
      paidAmount: 0,
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

  async function sendInvoice(method: "email" | "whatsapp") {
    if (!createdInvoice) return
    try {
      const res = await fetch(
        `/api/invoices/${encodeURIComponent(createdInvoice.id)}/send`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ method }),
        }
      )
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as any
        throw new Error(data?.error?.message || "Failed to send invoice")
      }
      const data = (await res.json()) as { pdfUrl?: string }
      if (data.pdfUrl) window.open(data.pdfUrl, "_blank", "noopener,noreferrer")
      toast({
        title: method === "email" ? "Email Sent" : "WhatsApp Message Sent",
        description: `Invoice ${createdInvoice.invoiceCode} exported as PDF and marked as sent`,
      })
      setSendDialogOpen(false)
      router.push("/invoices")
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "Failed to send invoice",
        variant: "destructive",
      })
    }
  }

  const handleSendViaEmail = () => sendInvoice("email")
  const handleSendViaWhatsApp = () => sendInvoice("whatsapp")

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
                              {tenant.shopNameEn || tenant.tenantCode || tenant.id}
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
                  name="currencyCode"
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
              Choose how you want to send invoice {createdInvoice?.invoiceCode} to the tenant.
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
