"use client"

import { AppShell } from "@/components/app-shell"
import { Breadcrumbs } from "@/components/breadcrumbs"

export default function PaymentDetailsPage() {
  return (
    <AppShell>
      <Breadcrumbs items={[{ label: "Payments", href: "/payments" }, { label: "Payment Details" }]} />
      <h1 className="text-3xl font-bold mb-6">Payment Details / Update Status</h1>
      <p className="text-muted-foreground">Payment details will be displayed here</p>
    </AppShell>
  )
}
