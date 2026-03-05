"use client"

import { AppShell } from "@/components/app-shell"
import { Breadcrumbs } from "@/components/breadcrumbs"

export default function EditRolePage() {
  return (
    <AppShell>
      <Breadcrumbs items={[{ label: "Roles", href: "/roles" }, { label: "Role Details / Edit Role" }]} />
      <h1 className="text-3xl font-bold mb-6">Role Details / Edit Role</h1>
      <p className="text-muted-foreground">Role form with permissions matrix will be displayed here</p>
    </AppShell>
  )
}
