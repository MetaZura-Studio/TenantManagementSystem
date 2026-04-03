"use client"

import { useEffect, useMemo, useState } from "react"
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
import { RequiredLabel } from "@/components/shared/forms/RequiredLabel"
import { useCreateInvoice } from "../hooks"
import { useTenants } from "@/features/tenants/hooks"
import { useSubscriptions } from "@/features/tenant-subscriptions/hooks"
import { useCurrencies } from "@/features/currency/hooks"
import type { Invoice } from "../types"
import type { TenantSubscription } from "@/features/tenant-subscriptions/types"
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

  const selectedTenantId = form.watch("tenantId")

  const tenantSubscriptions = useMemo(() => {
    if (!selectedTenantId) return []
    return subscriptions.filter((s) => s.tenantId === selectedTenantId)
  }, [subscriptions, selectedTenantId])

  const bestSubscriptionForTenant = useMemo(() => {
    if (tenantSubscriptions.length === 0) return null
    if (tenantSubscriptions.length === 1) return tenantSubscriptions[0]

    const statusPriority: Record<string, number> = {
      ACTIVE: 0,
      TRIAL: 1,
      TRIALING: 1,
      PAST_DUE: 2,
      SUSPENDED: 3,
      Pending: 4,
      EXPIRED: 5,
      Expired: 5,
      CANCELLED: 6,
      CANCELED: 6,
      Active: 0,
    }

    const toPriority = (s: TenantSubscription) =>
      statusPriority[String(s.status || "").toUpperCase()] ??
      statusPriority[String(s.status || "")] ??
      99

    const toTs = (d?: string) => (d ? Date.parse(d) || 0 : 0)

    return [...tenantSubscriptions].sort((a, b) => {
      const ap = toPriority(a)
      const bp = toPriority(b)
      if (ap !== bp) return ap - bp
      const aEnd = toTs(a.currentPeriodEnd ?? a.endDate ?? a.startDate)
      const bEnd = toTs(b.currentPeriodEnd ?? b.endDate ?? b.startDate)
      return bEnd - aEnd
    })[0]
  }, [tenantSubscriptions])

  useEffect(() => {
    // Auto-select subscription when tenant changes (or subscriptions load).
    if (!selectedTenantId) return
    const currentSubId = form.getValues("subscriptionId")

    const currentIsValid = !!currentSubId && tenantSubscriptions.some((s) => s.id === currentSubId)
    if (currentIsValid) return

    if (bestSubscriptionForTenant?.id) {
      form.setValue("subscriptionId", bestSubscriptionForTenant.id, {
        shouldDirty: true,
        shouldValidate: true,
      })
      if (bestSubscriptionForTenant.billingCurrency) {
        form.setValue("currencyCode", bestSubscriptionForTenant.billingCurrency, {
          shouldDirty: true,
          shouldValidate: true,
        })
      }
    } else {
      form.setValue("subscriptionId", "", { shouldDirty: true, shouldValidate: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTenantId, bestSubscriptionForTenant?.id])

  const onSubmit = (data: z.infer<typeof createInvoiceSchema>) => {
    const selectedTenant = tenants.find((t) => t.id === data.tenantId)
    const rawPrefix = selectedTenant?.invoicePrefix?.trim() || "INV"
    const safePrefix = rawPrefix.replace(/[^A-Za-z0-9]/g, "").toUpperCase() || "INV"
    const nextInvoiceCode = `${safePrefix}-${Date.now().toString().slice(-8)}`

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
                      <RequiredLabel>Tenant</RequiredLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value)
                          // Reset subscription so it can be auto-selected for the new tenant.
                          form.setValue("subscriptionId", "", { shouldDirty: true, shouldValidate: true })
                        }}
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
                      <RequiredLabel>Subscription</RequiredLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ""}
                        disabled={!selectedTenantId || tenantSubscriptions.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                !selectedTenantId
                                  ? "Select tenant first"
                                  : tenantSubscriptions.length === 0
                                    ? "No subscriptions for this tenant"
                                    : "Select subscription"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tenantSubscriptions.map((sub) => (
                            <SelectItem key={sub.id} value={sub.id}>
                              {sub.subscriptionId}{" "}
                              {sub.status ? `(${String(sub.status).toUpperCase()})` : ""}
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
                      <RequiredLabel>Period Start</RequiredLabel>
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
                      <RequiredLabel>Period End</RequiredLabel>
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
                      <RequiredLabel>Issue Date</RequiredLabel>
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
                      <RequiredLabel>Due Date</RequiredLabel>
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
                      <RequiredLabel>Currency</RequiredLabel>
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
