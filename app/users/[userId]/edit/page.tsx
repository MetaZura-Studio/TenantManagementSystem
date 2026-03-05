"use client"

import { AppShell } from "@/components/app-shell"
import { Breadcrumbs } from "@/components/breadcrumbs"

export default function EditUserPage() {
  return (
    <AppShell>
      <Breadcrumbs items={[{ label: "Users", href: "/users" }, { label: "Create/Edit User" }]} />
      <h1 className="text-3xl font-bold mb-6">Create/Edit User</h1>
      <p className="text-muted-foreground">User form will be displayed here</p>
    </AppShell>
  )
}
