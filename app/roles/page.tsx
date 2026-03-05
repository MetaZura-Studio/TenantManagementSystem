"use client"

import { AppShell } from "@/components/app-shell"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

export default function RolesPage() {
  const router = useRouter()
  return (
    <AppShell>
      <Breadcrumbs items={[{ label: "Roles" }]} />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Roles List</h1>
        <Button onClick={() => router.push("/roles/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Create Role
        </Button>
      </div>
      <p className="text-muted-foreground">Roles list will be displayed here</p>
    </AppShell>
  )
}
