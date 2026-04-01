"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/badges"
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/shared/cards"
import { PageHeader } from "@/components/shared/page-header"
import { usePayment, useUpdatePayment } from "../hooks"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/shared/feedback/use-toast"
import { ArrowLeft } from "lucide-react"
import { useState } from "react"

interface PaymentDetailPageProps {
  paymentId: string
}

export function PaymentDetailPage({ paymentId }: PaymentDetailPageProps) {
  const router = useRouter()
  const { data: payment, isLoading } = usePayment(paymentId)
  const updateMutation = useUpdatePayment()
  const [status, setStatus] = useState(payment?.status || "")

  const handleStatusUpdate = () => {
    if (payment) {
      updateMutation.mutate(
        {
          id: paymentId,
          updates: { status: status as any },
        },
        {
          onSuccess: () => {
            toast({
              title: "Success",
              description: "Payment status updated successfully",
            })
          },
          onError: () => {
            toast({
              title: "Error",
              description: "Failed to update payment status",
              variant: "destructive",
            })
          },
        }
      )
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!payment) {
    return <div className="text-center py-8">Payment not found</div>
  }

  return (
    <>
      <PageHeader
        title="Payment Details"
        subtitle={payment.paymentCode}
        breadcrumbs={[
          { label: "Payments", href: "/payments" },
          { label: "Payment Details" },
        ]}
        actions={
          <Button variant="outline" onClick={() => router.back()} size="lg">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      <div className="space-y-6">
        <GlassCard variant="default">
          <GlassCardHeader>
            <GlassCardTitle>Payment Summary</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Payment ID</p>
                <p className="text-lg font-medium">{payment.paymentCode}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <StatusBadge status={payment.status} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="text-lg font-medium">
                  {payment.currencyCode || ""} {payment.amount.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Method</p>
                <p className="text-lg font-medium">{payment.paymentMethod}</p>
              </div>
              {payment.transactionDate && (
                <div>
                  <p className="text-sm text-muted-foreground">Paid At</p>
                  <p className="text-lg font-medium">{payment.transactionDate}</p>
                </div>
              )}
              {payment.paymentGatewayRef && (
                <div>
                  <p className="text-sm text-muted-foreground">Transaction ID</p>
                  <p className="text-lg font-medium">{payment.paymentGatewayRef}</p>
                </div>
              )}
            </div>
          </GlassCardContent>
        </GlassCard>

        <GlassCard variant="default">
          <GlassCardHeader>
            <GlassCardTitle>Update Status</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="mb-2 block text-sm font-medium">Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUCCESS">SUCCESS</SelectItem>
                    <SelectItem value="PENDING">PENDING</SelectItem>
                    <SelectItem value="FAILED">FAILED</SelectItem>
                    <SelectItem value="REFUNDED">REFUNDED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleStatusUpdate} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Updating..." : "Update Status"}
              </Button>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    </>
  )
}
