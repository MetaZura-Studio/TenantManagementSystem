import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Breadcrumbs, type BreadcrumbItem } from "@/components/shared/breadcrumbs/Breadcrumbs"
import { cn } from "@/lib/utils"

interface PageHeaderV2Props {
  title: string
  subtitle?: string
  breadcrumbs: BreadcrumbItem[]
  actions?: ReactNode
  tabs?: {
    label: string
    value: string
    onClick: () => void
  }[]
  activeTab?: string
  className?: string
}

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  tabs,
  activeTab,
  className,
}: PageHeaderV2Props) {
  return (
    <div className={cn("space-y-6 mb-8", className)}>
      <Breadcrumbs items={breadcrumbs} className="text-xs" />
      
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-muted-foreground text-lg">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
      
      {tabs && tabs.length > 0 && (
        <div className="flex items-center gap-1 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={tab.onClick}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
                activeTab === tab.value
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
