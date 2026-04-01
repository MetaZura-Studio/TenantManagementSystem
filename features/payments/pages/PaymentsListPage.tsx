"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/badges"
import { GlassCard, GlassCardContent } from "@/components/shared/cards"
import { PageHeader } from "@/components/shared/page-header"
import { usePayments } from "../hooks"
import { useTenants } from "@/features/tenants/hooks"
import type { Payment } from "../types"
import { ColumnDef } from "@tanstack/react-table"
import { Eye, Printer, Download } from "lucide-react"
import Link from "next/link"

export function PaymentsListPage() {
  const router = useRouter()
  const { data: payments = [], isLoading } = usePayments()
  const { data: tenants = [] } = useTenants()

  const handlePrintPayment = (payment: Payment) => {
    // Create a printable window
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Receipt - ${payment.paymentCode}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .details { margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px; border-bottom: 1px solid #eee; }
            .label { font-weight: bold; }
            .footer { margin-top: 30px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Payment Receipt</h1>
          </div>
          <div class="details">
            <div class="detail-row">
              <span class="label">Payment ID:</span>
              <span>${payment.paymentCode}</span>
            </div>
            ${payment.invoiceId ? `
            <div class="detail-row">
              <span class="label">Invoice ID:</span>
              <span>${payment.invoiceId}</span>
            </div>
            ` : ""}
            <div class="detail-row">
              <span class="label">Amount:</span>
              <span>${payment.currencyCode || ""} ${payment.amount.toFixed(2)}</span>
            </div>
            ${payment.transactionDate ? `
            <div class="detail-row">
              <span class="label">Payment Date:</span>
              <span>${payment.transactionDate}</span>
            </div>
            ` : ""}
            <div class="detail-row">
              <span class="label">Payment Method:</span>
              <span>${payment.paymentMethod}</span>
            </div>
            <div class="detail-row">
              <span class="label">Status:</span>
              <span>${payment.status}</span>
            </div>
            ${payment.paymentGatewayRef ? `
            <div class="detail-row">
              <span class="label">Transaction ID:</span>
              <span>${payment.paymentGatewayRef}</span>
            </div>
            ` : ""}
            ${payment.paymentReference ? `
            <div class="detail-row">
              <span class="label">Payment Reference:</span>
              <span>${payment.paymentReference}</span>
            </div>
            ` : ""}
          </div>
          <div class="footer">
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  const handleDownloadPayment = (payment: Payment) => {
    // Create downloadable content
    let content = `Payment Receipt\n\nPayment ID: ${payment.paymentCode}\n`
    if (payment.invoiceId) content += `Invoice ID: ${payment.invoiceId}\n`
    content += `Amount: ${payment.currencyCode || ""} ${payment.amount.toFixed(2)}\n`
    if (payment.transactionDate) content += `Payment Date: ${payment.transactionDate}\n`
    content += `Payment Method: ${payment.paymentMethod}\n`
    content += `Status: ${payment.status}\n`
    if (payment.paymentGatewayRef) content += `Transaction ID: ${payment.paymentGatewayRef}\n`
    if (payment.paymentReference) content += `Payment Reference: ${payment.paymentReference}\n`
    content += `\nGenerated on ${new Date().toLocaleString()}`
    
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `payment-${payment.paymentCode}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const columns: ColumnDef<Payment>[] = [
    {
      accessorKey: "paymentCode",
      header: "Payment ID",
    },
    {
      id: "tenant",
      header: "Tenant",
      cell: ({ row }) => {
        const payment = row.original
        const tenant = tenants.find((t) => t.id === payment.tenantId)
        return tenant ? tenant.shopNameEn : "-"
      },
    },
    {
      accessorKey: "invoiceId",
      header: "Invoice ID",
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const payment = row.original
        const currency = payment.currencyCode || ""
        return `${currency} ${payment.amount.toFixed(2)}`.trim()
      },
    },
    {
      accessorKey: "transactionDate",
      header: "Payment Date",
      cell: ({ row }) => {
        const payment = row.original
        return payment.transactionDate || "-"
      },
    },
    {
      accessorKey: "paymentMethod",
      header: "Payment Method",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const payment = row.original
        return (
          <div className="flex items-center space-x-2">
            <Link href={`/payments/${payment.id}`}>
              <Button variant="ghost" size="icon" title="View payment">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handlePrintPayment(payment)}
              title="Print payment"
            >
              <Printer className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDownloadPayment(payment)}
              title="Download payment"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <>
      <PageHeader
        title="Payments"
        subtitle="View all payment records"
        breadcrumbs={[{ label: "Payments" }]}
      />

      {isLoading ? (
        <GlassCard variant="subtle">
          <GlassCardContent className="p-12">
            <div className="text-center text-muted-foreground">Loading...</div>
          </GlassCardContent>
        </GlassCard>
      ) : (
        <GlassCard variant="default">
          <GlassCardContent className="p-0">
            <DataTable columns={columns} data={payments} />
          </GlassCardContent>
        </GlassCard>
      )}
    </>
  )
}
