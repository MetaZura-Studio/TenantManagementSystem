"use client"

import { AppShell } from "@/components/app-shell"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

export default function BranchesPage() {
  const router = useRouter()
  return (
    <AppShell>
      <Breadcrumbs items={[{ label: "Tenant Management", href: "/tenants" }, { label: "Branches" }]} />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Branch Management</h1>
        <Button onClick={() => router.push("/branches/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Branch
        </Button>
      </div>
      <p className="text-muted-foreground">Branch list will be displayed here</p>
    </AppShell>
  )
}
