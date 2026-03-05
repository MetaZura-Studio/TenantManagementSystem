"use client"

import { AppShell } from "@/components/app-shell"
import { Breadcrumbs } from "@/components/breadcrumbs"

export default function CurrencyPage() {
  return (
    <AppShell>
      <Breadcrumbs items={[{ label: "Currency Lookup" }]} />
      <h1 className="text-3xl font-bold mb-6">Currency Lookup</h1>
      <p className="text-muted-foreground">Currency list will be displayed here</p>
    </AppShell>
  )
}
