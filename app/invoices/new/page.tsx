"use client"

import { AppShell } from "@/components/app-shell"
import { Breadcrumbs } from "@/components/breadcrumbs"

export default function CreateInvoicePage() {
  return (
    <AppShell>
      <Breadcrumbs items={[{ label: "Invoice Management", href: "/invoices" }, { label: "Create Invoice" }]} />
      <h1 className="text-3xl font-bold mb-6">Create Invoice</h1>
      <p className="text-muted-foreground">Invoice form will be displayed here</p>
    </AppShell>
  )
}
