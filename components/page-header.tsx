import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Breadcrumbs, BreadcrumbItem } from "@/components/breadcrumbs"

interface PageHeaderProps {
  title: string
  breadcrumbs: BreadcrumbItem[]
  action?: {
    label: string
    onClick: () => void
    icon?: ReactNode
  }
}

export function PageHeader({ title, breadcrumbs, action }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <Breadcrumbs items={breadcrumbs} className="mb-4" />
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{title}</h1>
        {action && (
          <Button onClick={action.onClick}>
            {action.icon}
            {action.label}
          </Button>
        )}
      </div>
    </div>
  )
}
