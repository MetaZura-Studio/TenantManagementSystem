"use client"

import { useEffect, useMemo } from "react"
import type { Invoice, InvoiceLine } from "../types"
import { useInvoice } from "../hooks"
import { useInvoiceLines } from "../hooks"
import { useTenants } from "@/features/tenants/hooks"

interface PrintInvoicePageProps {
  invoiceId: string
}

function computeLineTotal(line: InvoiceLine) {
  const qty = Number.isFinite(line.quantity) ? line.quantity : 0
  const unit = Number.isFinite(line.unitPrice) ? line.unitPrice : 0
  return qty * unit
}

export function PrintInvoicePage({ invoiceId }: PrintInvoicePageProps) {
  const { data: invoice, isLoading: invoiceLoading } = useInvoice(invoiceId)
  const { data: lines = [], isLoading: linesLoading } = useInvoiceLines(invoiceId)
  const { data: tenants = [] } = useTenants()

  const tenant = useMemo(() => {
    if (!invoice?.tenantId) return undefined
    return tenants.find((t) => t.id === invoice.tenantId)
  }, [invoice?.tenantId, tenants])

  const shouldPrint = !!invoice && !invoiceLoading && !linesLoading

  useEffect(() => {
    if (!shouldPrint) return

    // Let the browser paint the layout, then trigger print.
    const t = window.setTimeout(() => {
      window.print()
    }, 250)

    return () => window.clearTimeout(t)
  }, [shouldPrint])

  if (!invoice || invoiceLoading) {
    return (
      <div className="p-6">
        <div className="text-center text-muted-foreground">Loading invoice...</div>
      </div>
    )
  }

  const billToName = tenant?.contactPerson || tenant?.ownerName || "—"
  const billToPhone = tenant?.ownerMobile || "—"
  const billToAddress = [tenant?.address, tenant?.city, tenant?.country].filter(Boolean).join(", ") || "—"

  const fromName = tenant?.ownerName || "—"
  const fromPhone = tenant?.ownerMobile || "—"
  const fromAddress = billToAddress

  const subtotalLike = invoice.currencyCode + " " + (invoice.totalAmount - invoice.taxAmount + invoice.discountAmount).toFixed(2)

  return (
    <div style={{ background: "#ffffff" }}>
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
        }

        /* Layout inspired by your screenshot */
        .inv-root { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"; background: #fff; }
        .inv-header {
          position: relative;
          background: #0b4aa1;
          color: #fff;
          padding: 28px 36px;
          height: 190px;
          overflow: hidden;
        }
        .inv-header:after {
          content: "";
          position: absolute;
          left: -80px;
          right: -80px;
          bottom: -95px;
          height: 200px;
          background: #fff;
          border-radius: 180px;
          transform: rotate(-2deg);
        }
        .inv-header > * { position: relative; z-index: 1; }
        .inv-title { font-size: 54px; font-weight: 800; letter-spacing: 2px; line-height: 1; }
        .inv-invoice-no { position: absolute; right: 40px; top: 38px; font-weight: 700; font-size: 28px; }
        .inv-body { padding: 40px 36px 24px; margin-top: -18px; }

        .inv-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
        .inv-block-title { font-size: 24px; font-weight: 600; margin-bottom: 8px; }
        .inv-meta-label { color: #6b7a90; font-size: 18px; margin-top: 22px; }
        .inv-meta-value { font-size: 26px; font-weight: 500; margin-top: 6px; }

        .inv-table { width: 100%; border-collapse: collapse; margin-top: 34px; }
        .inv-table th {
          background: #0b4aa1;
          color: #fff;
          font-size: 20px;
          padding: 12px 10px;
          font-weight: 700;
          border: 1px solid #0b4aa1;
        }
        .inv-table td {
          border: 1px solid #4a4f57;
          padding: 10px 10px;
          font-size: 18px;
        }
        .inv-table td.num, .inv-table th.num { text-align: right; }
        .inv-table td.center { text-align: center; }

        .inv-subtotal-row { display:flex; justify-content:flex-end; margin-top: 18px; }
        .inv-subtotal {
          width: 280px;
          border: 1px solid #0b4aa1;
          background: #0b4aa1;
          color:#fff;
          text-align:right;
          padding: 12px 16px;
          font-size: 22px;
          font-weight: 700;
        }
        .inv-subtotal span { display:block; }

        .inv-note { margin-top: 26px; }
        .inv-note-title { font-size: 26px; font-weight: 700; margin-bottom: 10px; }
        .inv-note-lines { width: 340px; border-top: 2px solid #000; margin-top: 16px; }

        .inv-payment { margin-top: 60px; font-size: 22px; }
        .inv-payment-title { font-weight: 800; margin-bottom: 10px; }
        .inv-thank { text-align:right; font-size: 44px; font-weight: 800; color: #0b4aa1; }
      `}</style>

      <div className="inv-root">
        <div className="inv-header">
          <div className="inv-title">INVOICE</div>
          <div className="inv-invoice-no">NO: {invoice.invoiceCode}</div>
        </div>

        <div className="inv-body">
          <div className="inv-grid">
            <div>
              <div className="inv-block-title">Bill To:</div>
              <div style={{ fontSize: 26, marginTop: 8, lineHeight: 1.35 }}>
                <div>{billToName}</div>
                <div>{billToPhone}</div>
                <div>{billToAddress}</div>
              </div>
              <div className="inv-meta-label">Date: {invoice.issueDate}</div>
            </div>
            <div>
              <div className="inv-block-title">From:</div>
              <div style={{ fontSize: 26, marginTop: 8, lineHeight: 1.35 }}>
                <div>{fromName}</div>
                <div>{fromPhone}</div>
                <div>{fromAddress}</div>
              </div>
            </div>
          </div>

          <table className="inv-table">
            <thead>
              <tr>
                <th style={{ width: "55%" }}>Description</th>
                <th className="center" style={{ width: "10%" }}>Qty</th>
                <th className="num" style={{ width: "15%" }}>Price</th>
                <th className="num" style={{ width: "20%" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {lines
                .slice()
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((l) => {
                  const lineTotal = computeLineTotal(l)
                  return (
                    <tr key={l.id}>
                      <td>{l.description || l.lineType}</td>
                      <td className="center">{l.quantity}</td>
                      <td className="num">
                        {invoice.currencyCode} {Number(l.unitPrice).toFixed(2)}
                      </td>
                      <td className="num">
                        {invoice.currencyCode} {lineTotal.toFixed(2)}
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>

          <div className="inv-subtotal-row">
            <div className="inv-subtotal">
              <span style={{ float: "left" }}>Sub Total</span>
              <span>{subtotalLike}</span>
            </div>
          </div>

          <div className="inv-note">
            <div className="inv-note-title">Note:</div>
            <div className="inv-note-lines" />
            <div className="inv-note-lines" />
          </div>

          <div className="inv-payment">
            <div className="inv-payment-title">Payment Information:</div>
            <div className="inv-thank">Thank You!</div>
            <div style={{ marginTop: 12 }}>
              <div>Bank: Name Bank</div>
              <div>No Bank: {tenant?.ownerMobile || "—"}</div>
              <div>Email: {tenant?.ownerEmail || "—"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

