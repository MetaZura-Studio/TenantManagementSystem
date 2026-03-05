"use client"

import { AppShell } from "@/components/app-shell"
import { Breadcrumbs } from "@/components/breadcrumbs"

export default function UpgradeSubscriptionPage() {
  return (
    <AppShell>
      <Breadcrumbs items={[{ label: "Plans & Subscriptions", href: "/plans" }, { label: "Subscription Upgrade" }]} />
      <h1 className="text-3xl font-bold mb-6">Subscription Upgrade</h1>
      <p className="text-muted-foreground">Upgrade wizard will be displayed here</p>
    </AppShell>
  )
}
