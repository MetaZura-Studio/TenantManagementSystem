"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/badges"
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/shared/cards"
import { PageHeader } from "@/components/shared/page-header"
import { useInvoice, useInvoiceLines } from "../hooks"
import { Pencil, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface InvoiceDetailPageProps {
  invoiceId: string
}

export function InvoiceDetailPage({ invoiceId }: InvoiceDetailPageProps) {
  const router = useRouter()
  const { data: invoice, isLoading } = useInvoice(invoiceId)
  const { data: lines = [] } = useInvoiceLines(invoiceId)

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!invoice) {
    return <div className="text-center py-8">Invoice not found</div>
  }

  return (
    <>
      <PageHeader
        title="Invoice Details"
        subtitle={invoice.invoiceNumber}
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
                <p className="text-lg font-medium">{invoice.invoiceNumber}</p>
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
                  {invoice.currency} {invoice.subtotal.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-lg font-medium">
                  {invoice.currency} {invoice.total.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount Paid</p>
                <p className="text-lg font-medium">
                  {invoice.currency} {invoice.amountPaid.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount Due</p>
                <p className="text-lg font-medium">
                  {invoice.currency} {invoice.amountDue.toFixed(2)}
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
                        {line.quantity} x {invoice.currency} {line.unitPrice.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-medium">
                      {invoice.currency} {line.lineAmount.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </GlassCardContent>
          </GlassCard>
        )}
      </div>
    </>
  )
}
