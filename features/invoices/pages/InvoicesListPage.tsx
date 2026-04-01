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
import { useInvoices, useDeleteInvoice } from "../hooks"
import type { Invoice } from "../types"
import { ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash2, Plus, Eye } from "lucide-react"
import Link from "next/link"

function toInvoiceLifecycleStatus(invoice: Invoice): string {
  const raw = String(invoice.status || "").toUpperCase()
  if (raw === "DRAFT") return "DRAFT"
  if (raw === "CANCELLED") return "CANCELLED"
  // Current model mixes payment state into `status`; treat everything else as "ISSUED" lifecycle.
  return "ISSUED"
}

function toPaymentStatus(invoice: Invoice): string {
  const amountDue = Number(invoice.amountDue ?? 0)
  const paidAmount = Number(invoice.paidAmount ?? 0)

  if (amountDue <= 0) return "PAID"
  if (paidAmount > 0) return "PARTIALLY_PAID"

  const dueTs = invoice.dueDate ? Date.parse(invoice.dueDate) : NaN
  if (!Number.isNaN(dueTs)) {
    const today = new Date()
    const todayTs = Date.parse(today.toISOString().split("T")[0])
    if (dueTs < todayTs) return "OVERDUE"
  }

  return "UNPAID"
}

export function InvoicesListPage() {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null)

  const { data: invoices = [], isLoading } = useInvoices()
  const deleteMutation = useDeleteInvoice()

  const handleDelete = (id: string) => {
    setInvoiceToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (invoiceToDelete) {
      deleteMutation.mutate(invoiceToDelete, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Invoice deleted successfully",
          })
          setDeleteDialogOpen(false)
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to delete invoice",
            variant: "destructive",
          })
        },
      })
    }
  }

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: "invoiceCode",
      header: "Invoice Code",
    },
    {
      accessorKey: "tenantId",
      header: "Tenant ID",
    },
    {
      accessorKey: "issueDate",
      header: "Issue Date",
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
    },
    {
      accessorKey: "totalAmount",
      header: "Total Amount",
      cell: ({ row }) => {
        const invoice = row.original
        return `${invoice.currencyCode} ${invoice.totalAmount.toFixed(2)}`
      },
    },
    {
      id: "invoiceStatus",
      header: "Invoice Status",
      cell: ({ row }) => <StatusBadge status={toInvoiceLifecycleStatus(row.original)} />,
    },
    {
      id: "paymentStatus",
      header: "Payment Status",
      cell: ({ row }) => <StatusBadge status={toPaymentStatus(row.original)} />,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const invoice = row.original
        return (
          <div className="flex items-center space-x-2">
            <Link href={`/invoices/${invoice.id}`}>
              <Button variant="ghost" size="icon">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            <Link href={`/invoices/${invoice.id}/edit`}>
              <Button variant="ghost" size="icon">
                <Pencil className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(invoice.id)}
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
        title="Invoice Management"
        subtitle="Manage all invoices"
        breadcrumbs={[{ label: "Invoice Management" }]}
        actions={
          <Button onClick={() => router.push("/invoices/new")} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Add New
          </Button>
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
            <DataTable columns={columns} data={invoices} />
          </GlassCardContent>
        </GlassCard>
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Invoice"
        description="Are you sure you want to delete this invoice? This action cannot be undone."
        onConfirm={confirmDelete}
        confirmLabel="Delete"
        variant="destructive"
      />
    </>
  )
}
