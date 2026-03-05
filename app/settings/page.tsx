"use client"

import { AppShell } from "@/components/app-shell"
import { Breadcrumbs } from "@/components/breadcrumbs"

export default function SettingsPage() {
  return (
    <AppShell>
      <Breadcrumbs items={[{ label: "Settings" }]} />
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <p className="text-muted-foreground">Settings will be displayed here</p>
    </AppShell>
  )
}
