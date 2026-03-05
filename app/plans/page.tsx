"use client"

import { AppShell } from "@/components/app-shell"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PlansPage() {
  const router = useRouter()
  return (
    <AppShell>
      <Breadcrumbs items={[{ label: "Plans & Subscriptions", href: "/plans" }, { label: "Plans List" }]} />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Plans List</h1>
        <Button onClick={() => router.push("/plans/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>
      <p className="text-muted-foreground">Plans list will be displayed here</p>
    </AppShell>
  )
}
