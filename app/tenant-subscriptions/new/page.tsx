"use client"

import { AppShell } from "@/components/app-shell"
import { Breadcrumbs } from "@/components/breadcrumbs"

export default function CreateSubscriptionPage() {
  return (
    <AppShell>
      <Breadcrumbs items={[{ label: "Plans & Subscriptions", href: "/plans" }, { label: "Add/Edit Subscription" }]} />
      <h1 className="text-3xl font-bold mb-6">Add/Edit Subscription</h1>
      <p className="text-muted-foreground">Subscription form will be displayed here</p>
    </AppShell>
  )
}
