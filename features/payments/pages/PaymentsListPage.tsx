"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/badges"
import { GlassCard, GlassCardContent } from "@/components/shared/cards"
import { PageHeader } from "@/components/shared/page-header"
import { usePayments } from "../hooks"
import type { Payment } from "../types"
import { ColumnDef } from "@tanstack/react-table"
import { Eye } from "lucide-react"
import Link from "next/link"

export function PaymentsListPage() {
  const router = useRouter()
  const { data: payments = [], isLoading } = usePayments()

  const columns: ColumnDef<Payment>[] = [
    {
      accessorKey: "paymentId",
      header: "Payment ID",
    },
    {
      accessorKey: "invoiceId",
      header: "Invoice ID",
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const payment = row.original
        return `${payment.currency} ${payment.amount.toFixed(2)}`
      },
    },
    {
      accessorKey: "paymentDate",
      header: "Payment Date",
    },
    {
      accessorKey: "paymentMethod",
      header: "Payment Method",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const payment = row.original
        return (
          <div className="flex items-center space-x-2">
            <Link href={`/payments/${payment.id}`}>
              <Button variant="ghost" size="icon">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )
      },
    },
  ]

  return (
    <>
      <PageHeader
        title="Payments"
        subtitle="View all payment records"
        breadcrumbs={[{ label: "Payments" }]}
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
            <DataTable columns={columns} data={payments} />
          </GlassCardContent>
        </GlassCard>
      )}
    </>
  )
}
