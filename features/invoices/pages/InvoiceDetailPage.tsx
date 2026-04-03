"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/badges"
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/shared/cards"
import { PageHeader } from "@/components/shared/page-header"
import { useInvoice, useInvoiceLines } from "../hooks"
import { Pencil, ArrowLeft } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useCreatePayment } from "@/features/payments/hooks"
import type { Payment } from "@/features/payments/types"
import { toast } from "@/components/shared/feedback/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query/queryKeys"
import { useTenants } from "@/features/tenants/hooks"

interface InvoiceDetailPageProps {
  invoiceId: string
}

const recordPaymentSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  paymentMethod: z.enum(["Credit Card", "Bank Transfer", "Cash", "Other"]),
  paymentReference: z.string().min(1, "Payment reference is required"),
  status: z.enum(["SUCCESS", "PENDING", "FAILED", "REFUNDED"]),
  transactionDate: z.string().min(1, "Payment date is required"),
})

export function InvoiceDetailPage({ invoiceId }: InvoiceDetailPageProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: invoice, isLoading } = useInvoice(invoiceId)
  const { data: lines = [] } = useInvoiceLines(invoiceId)
  const { data: tenants = [] } = useTenants()
  const createPaymentMutation = useCreatePayment()
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false)

  const paymentForm = useForm<z.infer<typeof recordPaymentSchema>>({
    resolver: zodResolver(recordPaymentSchema),
    defaultValues: {
      amount: 0,
      paymentMethod: "Cash",
      paymentReference: "",
      status: "SUCCESS",
      transactionDate: new Date().toISOString().split("T")[0],
    },
  })

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!invoice) {
    return <div className="text-center py-8">Invoice not found</div>
  }

  const openRecordPayment = () => {
    paymentForm.reset({
      amount: Number(invoice.amountDue ?? 0),
      paymentMethod: "Cash",
      paymentReference: `INV-${invoice.invoiceCode}`,
      status: "SUCCESS",
      transactionDate: new Date().toISOString().split("T")[0],
    })
    setRecordPaymentOpen(true)
  }

  const submitRecordPayment = (data: z.infer<typeof recordPaymentSchema>) => {
    const payload: Omit<Payment, "id" | "createdAt" | "updatedAt"> = {
      paymentCode: `PAY-${Date.now().toString().slice(-8)}`,
      paymentReference: data.paymentReference,
      tenantId: invoice.tenantId,
      invoiceId: invoice.id,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      status: data.status,
      transactionDate: data.transactionDate,
    }

    createPaymentMutation.mutate(payload, {
      onSuccess: () => {
        toast({
          title: "Payment recorded",
          description: "Payment saved and invoice totals updated.",
        })
        setRecordPaymentOpen(false)
        queryClient.invalidateQueries({ queryKey: queryKeys.invoices.detail(invoice.id) })
        queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all })
      },
      onError: (e: any) => {
        toast({
          title: "Error",
          description: e?.message || "Failed to record payment",
          variant: "destructive",
        })
      },
    })
  }

  return (
    <>
      <PageHeader
        title="Invoice Details"
        subtitle={invoice.invoiceCode}
        breadcrumbs={[
          { label: "Invoice Management", href: "/invoices" },
          { label: "Invoice Details" },
        ]}
        actions={
          <>
            <Button variant="outline" onClick={() => router.back()} size="lg">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button variant="outline" onClick={openRecordPayment} size="lg">
              Record Payment
            </Button>
            <Link href={`/invoices/${invoiceId}/edit`}>
              <Button size="lg">
                <Pencil className="mr-2 h-4 w-4" />
                Edit Invoice
              </Button>
            </Link>
          </>
        }
      />

      <div className="space-y-6">
        <GlassCard variant="default">
          <GlassCardHeader>
            <GlassCardTitle>Invoice Summary</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Invoice Number</p>
                <p className="text-lg font-medium">{invoice.invoiceCode}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Tenant</p>
                <p className="text-lg font-medium">
                  {invoice.tenantId ? tenants.find((t) => t.id === invoice.tenantId)?.shopNameEn ?? invoice.tenantId : "—"}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <StatusBadge status={invoice.status} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Issue Date</p>
                <p className="text-lg font-medium">{invoice.issueDate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Due Date</p>
                <p className="text-lg font-medium">{invoice.dueDate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Subtotal</p>
                <p className="text-lg font-medium">
                  {invoice.currencyCode} {(invoice.totalAmount - invoice.taxAmount + invoice.discountAmount).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-lg font-medium">
                  {invoice.currencyCode} {invoice.totalAmount.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount Paid</p>
                <p className="text-lg font-medium">
                  {invoice.currencyCode} {invoice.paidAmount.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount Due</p>
                <p className="text-lg font-medium">
                  {invoice.currencyCode} {invoice.amountDue.toFixed(2)}
                </p>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        {lines.length > 0 && (
          <GlassCard variant="default">
            <GlassCardHeader>
              <GlassCardTitle>Line Items</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="space-y-2">
                {lines.map((line) => (
                  <div key={line.id} className="flex items-center justify-between p-2 border rounded-lg">
                    <div>
                      <p className="font-medium">{line.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {line.quantity} x {invoice.currencyCode} {line.unitPrice.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-medium">
                      {invoice.currencyCode} {(line.quantity * line.unitPrice).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </GlassCardContent>
          </GlassCard>
        )}
      </div>

      <Dialog open={recordPaymentOpen} onOpenChange={setRecordPaymentOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Manually record a payment against invoice{" "}
              <span className="font-medium">{invoice.invoiceCode}</span>.
            </DialogDescription>
          </DialogHeader>

          <Form {...paymentForm}>
            <form
              onSubmit={paymentForm.handleSubmit(submitRecordPayment)}
              className="space-y-4"
            >
              <FormField
                control={paymentForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Enter amount paid"
                        value={field.value}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={paymentForm.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Cash">Cash</SelectItem>
                          <SelectItem value="Credit Card">Credit Card</SelectItem>
                          <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={paymentForm.control}
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
                          <SelectItem value="SUCCESS">SUCCESS</SelectItem>
                          <SelectItem value="PENDING">PENDING</SelectItem>
                          <SelectItem value="FAILED">FAILED</SelectItem>
                          <SelectItem value="REFUNDED">REFUNDED</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={paymentForm.control}
                name="paymentReference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Reference</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. bank ref / receipt no" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={paymentForm.control}
                name="transactionDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRecordPaymentOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createPaymentMutation.isPending}>
                  {createPaymentMutation.isPending ? "Saving..." : "Save Payment"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
