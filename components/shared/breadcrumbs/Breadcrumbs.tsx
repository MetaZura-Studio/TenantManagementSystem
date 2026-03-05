import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav className={cn("flex items-center gap-1.5 text-xs text-muted-foreground", className)}>
      <Link
        href="/dashboard"
        className="hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted/50"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1.5">
          <ChevronRight className="h-3 w-3 opacity-50" />
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-foreground transition-colors px-1.5 py-0.5 rounded-md hover:bg-muted/50"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium px-1.5 py-0.5">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}
