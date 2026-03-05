"use client"

import { AppShell } from "@/components/app-shell"
import { Breadcrumbs } from "@/components/breadcrumbs"

export default function UserDetailsPage() {
  return (
    <AppShell>
      <Breadcrumbs items={[{ label: "Users", href: "/users" }, { label: "User Details" }]} />
      <h1 className="text-3xl font-bold mb-6">User Details</h1>
      <p className="text-muted-foreground">User details will be displayed here</p>
    </AppShell>
  )
}
