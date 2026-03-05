import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { TenantStatus, SubscriptionStatus, UserStatus, PaymentStatus, InvoiceStatus, PlanStatus } from "@/lib/types"

interface StatusBadgeProps {
  status: TenantStatus | SubscriptionStatus | UserStatus | PaymentStatus | InvoiceStatus | PlanStatus | string
  variant?: "default" | "success" | "warning" | "destructive" | "secondary"
  className?: string
}

export function StatusBadge({ status, variant, className }: StatusBadgeProps) {
  const getVariant = () => {
    if (variant) return variant
    
    const statusLower = status.toLowerCase()
    if (statusLower === "active" || statusLower === "paid" || statusLower === "completed") {
      return "success"
    }
    if (statusLower === "pending" || statusLower === "trialing" || statusLower === "partially_paid") {
      return "warning"
    }
    if (statusLower === "inactive" || statusLower === "expired" || statusLower === "failed" || statusLower === "overdue" || statusLower === "past_due" || statusLower === "issued") {
      return "destructive"
    }
    return "secondary"
  }

  return (
    <Badge
      variant={getVariant()}
      className={cn(
        "rounded-full px-3 py-1 text-xs font-medium border backdrop-blur-sm",
        className
      )}
    >
      {status}
    </Badge>
  )
}
