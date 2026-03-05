"use client"

import { AppShell } from "@/components/app-shell"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

export default function TenantSubscriptionsPage() {
  const router = useRouter()
  return (
    <AppShell>
      <Breadcrumbs items={[{ label: "Plans & Subscriptions", href: "/plans" }, { label: "Tenant Subscription" }]} />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tenant Subscriptions</h1>
        <Button onClick={() => router.push("/tenant-subscriptions/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Subscription
        </Button>
      </div>
      <p className="text-muted-foreground">Subscriptions list will be displayed here</p>
    </AppShell>
  )
}
