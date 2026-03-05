"use client"

import { AppShell } from "@/components/app-shell"
import { Breadcrumbs } from "@/components/breadcrumbs"

export default function EditInvoicePage() {
  return (
    <AppShell>
      <Breadcrumbs items={[{ label: "Invoice Management", href: "/invoices" }, { label: "Edit Invoice" }]} />
      <h1 className="text-3xl font-bold mb-6">Edit Invoice</h1>
      <p className="text-muted-foreground">Invoice form will be displayed here</p>
    </AppShell>
  )
}
