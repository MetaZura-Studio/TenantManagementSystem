"use client"

import { AppShell } from "@/components/app-shell"
import { Breadcrumbs } from "@/components/breadcrumbs"

export default function InvoiceDetailsPage() {
  return (
    <AppShell>
      <Breadcrumbs items={[{ label: "Invoice Management", href: "/invoices" }, { label: "Invoice Details" }]} />
      <h1 className="text-3xl font-bold mb-6">Invoice Details</h1>
      <p className="text-muted-foreground">Invoice details with line items will be displayed here</p>
    </AppShell>
  )
}
