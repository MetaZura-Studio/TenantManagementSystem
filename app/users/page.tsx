"use client"

import { AppShell } from "@/components/app-shell"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

export default function UsersPage() {
  const router = useRouter()
  return (
    <AppShell>
      <Breadcrumbs items={[{ label: "Users" }]} />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Users List</h1>
        <Button onClick={() => router.push("/users/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add New User
        </Button>
      </div>
      <p className="text-muted-foreground">Users list will be displayed here</p>
    </AppShell>
  )
}
