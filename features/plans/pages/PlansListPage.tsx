"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/badges"
import { ConfirmDialog } from "@/components/shared/feedback"
import { GlassCard, GlassCardContent } from "@/components/shared/cards"
import { PageHeader } from "@/components/shared/page-header"
import { toast } from "@/components/shared/feedback/use-toast"
import { usePlans, useDeletePlan } from "../hooks"
import type { Plan } from "../types"
import { ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash2, Plus } from "lucide-react"
import Link from "next/link"

export function PlansListPage() {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [planToDelete, setPlanToDelete] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    planName: "",
    status: "All",
    billingCycle: "All",
  })

  const { data: plans = [], isLoading } = usePlans()
  const deleteMutation = useDeletePlan()

  const filteredPlans = plans.filter((plan) => {
    const planName = (plan.nameEn || "").toLowerCase()
    if (filters.planName && !planName.includes(filters.planName.toLowerCase())) {
      return false
    }
    const statusLabel = plan.isActive ? "Active" : "Inactive"
    if (filters.status !== "All" && statusLabel !== filters.status) {
      return false
    }
    if (filters.billingCycle !== "All" && plan.billingCycle !== filters.billingCycle) {
      return false
    }
    return true
  })

  const handleDelete = (id: string) => {
    setPlanToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (planToDelete) {
      deleteMutation.mutate(planToDelete, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Plan deleted successfully",
          })
          setDeleteDialogOpen(false)
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to delete plan",
            variant: "destructive",
          })
        },
      })
    }
  }

  const columns: ColumnDef<Plan>[] = [
    {
      accessorKey: "planCode",
      header: "Plan Code",
    },
    {
      accessorKey: "nameEn",
      header: "Plan Name",
    },
    {
      accessorKey: "billingCycle",
      header: "Billing Cycle",
    },
    {
      id: "price",
      header: "Price",
      cell: ({ row }) => {
        const plan = row.original
        const price = plan.billingCycle === "Yearly" ? plan.yearlyPrice : plan.monthlyPrice
        return `${plan.currencyCode} ${Number(price ?? 0).toFixed(2)}`
      },
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.isActive ? "Active" : "Inactive"} />,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const plan = row.original
        return (
          <div className="flex items-center space-x-2">
            <Link href={`/plans/${plan.id}/edit`}>
              <Button variant="ghost" size="icon">
                <Pencil className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(plan.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <>
      <PageHeader
        title="Plans List"
        subtitle="Manage subscription plans"
        breadcrumbs={[
          { label: "Plans & Subscriptions", href: "/plans" },
          { label: "Plans List" },
        ]}
        actions={
          <Button onClick={() => router.push("/plans/new")} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Add New
          </Button>
        }
      />

      <GlassCard variant="subtle" className="mb-6">
        <GlassCardContent className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium">Plan Name</label>
              <Input
                placeholder="Search by plan name..."
                value={filters.planName}
                onChange={(e) => setFilters({ ...filters, planName: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Status</label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Billing Cycle</label>
              <Select
                value={filters.billingCycle}
                onValueChange={(value) => setFilters({ ...filters, billingCycle: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </GlassCardContent>
      </GlassCard>

      {isLoading ? (
        <GlassCard variant="subtle">
          <GlassCardContent className="p-12">
            <div className="text-center text-muted-foreground">Loading...</div>
          </GlassCardContent>
        </GlassCard>
      ) : (
        <GlassCard variant="default">
          <GlassCardContent className="p-0">
            <DataTable columns={columns} data={filteredPlans} />
          </GlassCardContent>
        </GlassCard>
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Plan"
        description="Are you sure you want to delete this plan? This action cannot be undone."
        onConfirm={confirmDelete}
        confirmLabel="Delete"
        variant="destructive"
      />
    </>
  )
}
