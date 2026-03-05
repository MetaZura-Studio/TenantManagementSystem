import * as React from "react"
import { cn } from "@/lib/utils"
import { GlassCard, GlassCardContent } from "./GlassCard"
import { LucideIcon } from "lucide-react"

interface ModernStatCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: {
    value: string
    isPositive: boolean
  }
  className?: string
}

export function ModernStatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: ModernStatCardProps) {
  return (
    <GlassCard variant="subtle" className={cn("group", className)}>
      <GlassCardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold tracking-tight">{value}</p>
              {trend && (
                <span
                  className={cn(
                    "text-sm font-medium",
                    trend.isPositive
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  )}
                >
                  {trend.isPositive ? "↑" : "↓"} {trend.value}
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          {Icon && (
            <div className="p-3 rounded-xl bg-primary/10 dark:bg-primary/20">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>
      </GlassCardContent>
    </GlassCard>
  )
}
