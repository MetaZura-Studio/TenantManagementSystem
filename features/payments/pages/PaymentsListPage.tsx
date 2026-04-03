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

    const currency = payment.currencyCode || ""
    const amount = `${currency} ${payment.amount.toFixed(2)}`.trim()
    const paidAt = payment.transactionDate || "-"

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Receipt - ${payment.paymentCode}</title>
          <style>
            :root { --navy:#0d2a38; --accent:#b87540; --muted:#6b7280; --bg:#eef2f6; }
            * { box-sizing: border-box; }
            body { font-family: Arial, sans-serif; margin:0; background: var(--bg); color:#111827; }
            .page { width: 760px; margin: 22px auto; background:#fff; border-radius: 10px; overflow:hidden; box-shadow: 0 18px 36px rgba(15,23,42,0.14); }

            /* header with wave-like separator */
            .topbar { position: relative; height: 150px; background: var(--navy); color:#fff; }
            .topbar svg { position:absolute; left:0; right:0; bottom:-1px; width:100%; height:90px; }
            .brand { position:absolute; left:34px; top:26px; display:flex; align-items:center; gap:12px; }
            .logo { width:46px; height:46px; border-radius:10px; background: rgba(255,255,255,0.16); display:flex; align-items:center; justify-content:center; font-weight:800; }
            .brand .name { font-weight:800; letter-spacing:0.5px; }
            .badge { position:absolute; right:34px; top:32px; border:2px solid rgba(255,255,255,0.85); padding:8px 14px; font-weight:900; letter-spacing:1.2px; }

            .content { padding: 26px 34px 10px; }
            .grid { display:grid; grid-template-columns: 1fr 1fr; gap:22px; }
            .meta { font-size: 12px; line-height: 1.35; }
            .meta .k { font-weight:800; }
            .meta .v { font-weight:600; }

            .metaBox { background:#f7fafc; border:1px solid #e5e7eb; border-radius:10px; padding:14px 14px; }
            .metaBox.dark { background: #0f2b3a; border-color:#0f2b3a; color:#fff; }
            .metaRow { display:flex; justify-content:space-between; padding:7px 0; border-bottom:1px solid rgba(0,0,0,0.06); }
            .metaBox.dark .metaRow { border-bottom: 1px solid rgba(255,255,255,0.12); }
            .metaRow:last-child { border-bottom:none; }

            /* table */
            table { width:100%; border-collapse: collapse; margin-top: 18px; border:2px solid #111827; }
            thead th { background: var(--accent); color:#fff; padding:10px 8px; text-align:left; font-size:12px; letter-spacing:0.5px; }
            tbody td { padding:10px 8px; font-size:12px; border-top:2px solid #111827; }
            tbody tr:nth-child(even) td { background:#ececec; }
            td.num { text-align:right; }
            td.center { text-align:center; }
            .totals { display:flex; justify-content:flex-end; margin-top: 14px; }
            .totalsBox { width: 260px; font-size: 12px; }
            .totalsLine { display:flex; justify-content:space-between; padding:7px 0; }
            .totalsLabel { font-weight:800; }
            .grand { background: var(--accent); color:#fff; padding:8px 10px; font-weight:900; }

            .signature { margin-top: 24px; }
            .sigLine { width: 170px; border-top:2px solid #111827; margin-top: 32px; padding-top:6px; font-size: 12px; font-weight:800; }

            .footer { margin-top: 18px; background: var(--navy); color:#fff; padding: 16px 34px 18px; position:relative; }
            .footer:before { content:""; position:absolute; left:0; right:0; top:0; height:6px; background: var(--accent); }
            .footer small { display:block; opacity:0.9; line-height:1.35; }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="topbar">
              <div class="brand">
                <div class="logo">P</div>
                <div>
                  <div class="name">COMPANY NAME</div>
                  <small style="opacity:0.85">Payment Receipt</small>
                </div>
              </div>
              <div class="badge">RECEIPT</div>
              <svg viewBox="0 0 1000 200" preserveAspectRatio="none" aria-hidden="true">
                <path d="M0,120 C220,190 420,70 620,120 C780,160 870,180 1000,120 L1000,200 L0,200 Z" fill="#ffffff"/>
                <path d="M0,128 C220,198 420,78 620,128 C780,168 870,188 1000,128 L1000,138 L0,138 Z" fill="${"var(--accent)"}" opacity="0.95"/>
              </svg>
            </div>
            <div class="content">
              <div class="grid">
                <div class="meta">
                  <div class="k">RECEIPT TO:</div>
                  <div class="v">TENANT #${payment.tenantId}</div>
                  <div style="margin-top:10px" class="k">EMAIL:</div>
                  <div class="v">-</div>
                  <div style="margin-top:10px" class="k">ADDRESS:</div>
                  <div class="v">-</div>
                </div>
                <div class="metaBox dark">
                  <div class="metaRow"><span class="k">PAYMENT NO:</span><span class="v">${payment.paymentCode}</span></div>
                  ${payment.invoiceId ? `<div class="metaRow"><span class="k">INVOICE ID:</span><span class="v">${payment.invoiceId}</span></div>` : ""}
                  <div class="metaRow"><span class="k">DATE:</span><span class="v">${paidAt}</span></div>
                  <div class="metaRow"><span class="k">METHOD:</span><span class="v">${payment.paymentMethod}</span></div>
                  <div class="metaRow"><span class="k">STATUS:</span><span class="v">${String(payment.status).toUpperCase()}</span></div>
                  <div class="metaRow"><span class="k">TOTAL:</span><span class="v">${amount}</span></div>
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th style="width:52px">SL</th>
                    <th>DESCRIPTION</th>
                    <th style="width:110px" class="num">PRICE</th>
                    <th style="width:70px" class="center">QTY</th>
                    <th style="width:120px" class="num">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="center">1</td>
                    <td>Payment received ${payment.invoiceId ? `for Invoice #${payment.invoiceId}` : ""}</td>
                    <td class="num">${amount}</td>
                    <td class="center">1</td>
                    <td class="num">${amount}</td>
                  </tr>
                  <tr><td class="center">2</td><td>&nbsp;</td><td class="num">&nbsp;</td><td class="center">&nbsp;</td><td class="num">&nbsp;</td></tr>
                  <tr><td class="center">3</td><td>&nbsp;</td><td class="num">&nbsp;</td><td class="center">&nbsp;</td><td class="num">&nbsp;</td></tr>
                  <tr><td class="center">4</td><td>&nbsp;</td><td class="num">&nbsp;</td><td class="center">&nbsp;</td><td class="num">&nbsp;</td></tr>
                  <tr><td class="center">5</td><td>&nbsp;</td><td class="num">&nbsp;</td><td class="center">&nbsp;</td><td class="num">&nbsp;</td></tr>
                </tbody>
              </table>

              <div class="totals">
                <div class="totalsBox">
                  <div class="totalsLine"><span class="totalsLabel">TOTAL</span><span>${amount}</span></div>
                  <div class="totalsLine"><span class="totalsLabel">DISC:</span><span>-</span></div>
                  <div class="totalsLine"><span class="totalsLabel">VAT:</span><span>-</span></div>
                  <div class="totalsLine grand"><span>GRAND TOTAL</span><span>${amount}</span></div>
                </div>
              </div>

              <div class="signature">
                <div class="sigLine">SIGNATURE</div>
              </div>
            </div>
            <div class="footer">
              <small>Your website name</small>
              <small>Your email name</small>
              <small style="margin-top:10px; opacity:0.85">Generated on ${new Date().toLocaleString()}</small>
            </div>
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
