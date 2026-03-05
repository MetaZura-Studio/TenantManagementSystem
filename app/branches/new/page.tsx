"use client"

import { AppShell } from "@/components/app-shell"
import { Breadcrumbs } from "@/components/breadcrumbs"

export default function CreateBranchPage() {
  return (
    <AppShell>
      <Breadcrumbs items={[{ label: "Tenant Management", href: "/tenants" }, { label: "Branches", href: "/branches" }, { label: "Add/Edit Branch" }]} />
      <h1 className="text-3xl font-bold mb-6">Add/Edit Branch</h1>
      <p className="text-muted-foreground">Branch form will be displayed here</p>
    </AppShell>
  )
}
