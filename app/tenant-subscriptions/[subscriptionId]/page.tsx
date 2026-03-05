"use client"

import { AppShell } from "@/components/app-shell"
import { Breadcrumbs } from "@/components/breadcrumbs"

export default function SubscriptionDetailsPage() {
  return (
    <AppShell>
      <Breadcrumbs items={[{ label: "Plans & Subscriptions", href: "/plans" }, { label: "Tenant Subscription" }]} />
      <h1 className="text-3xl font-bold mb-6">Tenant Subscription</h1>
      <p className="text-muted-foreground">Subscription details will be displayed here</p>
    </AppShell>
  )
}
