"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/badges"
import { ConfirmDialog } from "@/components/shared/feedback"
import { GlassCard, GlassCardContent } from "@/components/shared/cards"
import { PageHeader } from "@/components/shared/page-header"
import { toast } from "@/components/shared/feedback/use-toast"
import { useSubscriptions, useDeleteSubscription } from "../hooks"
import type { TenantSubscription } from "../types"
import { ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash2, Plus, Eye } from "lucide-react"
import Link from "next/link"

export function SubscriptionsListPage() {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<string | null>(null)

  const { data: subscriptions = [], isLoading } = useSubscriptions()
  const deleteMutation = useDeleteSubscription()

  const handleDelete = (id: string) => {
    setSubscriptionToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (subscriptionToDelete) {
      deleteMutation.mutate(subscriptionToDelete, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Subscription deleted successfully",
          })
          setDeleteDialogOpen(false)
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to delete subscription",
            variant: "destructive",
          })
        },
      })
    }
  }

  const columns: ColumnDef<TenantSubscription>[] = [
    {
      accessorKey: "subscriptionId",
      header: "Subscription ID",
    },
    {
      accessorKey: "tenantId",
      header: "Tenant ID",
    },
    {
      accessorKey: "planId",
      header: "Plan ID",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
    },
    {
      accessorKey: "currentPeriodEnd",
      header: "Period End",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const subscription = row.original
        return (
          <div className="flex items-center space-x-2">
            <Link href={`/tenant-subscriptions/${subscription.id}`}>
              <Button variant="ghost" size="icon">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            <Link href={`/tenant-subscriptions/${subscription.id}/edit`}>
              <Button variant="ghost" size="icon">
                <Pencil className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(subscription.id)}
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
        title="Tenant Subscriptions"
        subtitle="Manage tenant subscriptions"
        breadcrumbs={[
          { label: "Plans & Subscriptions", href: "/plans" },
          { label: "Tenant Subscriptions" },
        ]}
        actions={
          <>
            <Button onClick={() => router.push("/tenant-subscriptions/upgrade")} variant="outline" size="lg">
              Upgrade Plan
            </Button>
            <Button onClick={() => router.push("/tenant-subscriptions/new")} size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Add Subscription
            </Button>
          </>
        }
      />

      {isLoading ? (
        <GlassCard variant="subtle">
          <GlassCardContent className="p-12">
            <div className="text-center text-muted-foreground">Loading...</div>
          </GlassCardContent>
        </GlassCard>
      ) : (
        <GlassCard variant="default">
          <GlassCardContent className="p-0">
            <DataTable columns={columns} data={subscriptions} />
          </GlassCardContent>
        </GlassCard>
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Subscription"
        description="Are you sure you want to delete this subscription? This action cannot be undone."
        onConfirm={confirmDelete}
        confirmLabel="Delete"
        variant="destructive"
      />
    </>
  )
}
