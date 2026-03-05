"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  ChevronDown,
  ChevronRight,
  Menu,
  X,
} from "lucide-react"
import { useState } from "react"
import { navItems, type NavItem } from "./NavItems"

function NavItemComponent({ item, isCollapsed }: { item: NavItem; isCollapsed?: boolean }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(
    item.children?.some((child) => pathname === child.href) || false
  )

  const isActive = pathname === item.href || item.children?.some((child) => pathname === child.href)

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-muted/50",
            isActive && "bg-primary/10 text-primary"
          )}
        >
          <div className="flex items-center space-x-3">
            <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-primary")} />
            {!isCollapsed && <span>{item.title}</span>}
          </div>
          {!isCollapsed && (
            isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )
          )}
        </button>
        {isOpen && !isCollapsed && (
          <div className="ml-4 mt-1 space-y-1">
            {item.children.map((child) => {
              const childIsActive = pathname === child.href
              return (
                <Link
                  key={child.href}
                  href={child.href!}
                  className={cn(
                    "flex items-center space-x-3 rounded-xl px-3 py-2 text-sm transition-all duration-200 hover:bg-muted/50",
                    childIsActive && "bg-primary/10 text-primary font-medium"
                  )}
                >
                  <child.icon className="h-4 w-4 flex-shrink-0" />
                  <span>{child.title}</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <Link
      href={item.href!}
      className={cn(
        "flex items-center space-x-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-muted/50 relative group",
        isActive && "bg-primary/10 text-primary"
      )}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
      )}
      <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-primary")} />
      {!isCollapsed && <span>{item.title}</span>}
    </Link>
  )
}

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside
      style={{ width: isCollapsed ? 80 : 256 }}
      className="flex h-full flex-col border-r border-border/40 bg-background/80 backdrop-blur-xl transition-all duration-300 flex-shrink-0"
    >
      <div className="flex h-16 items-center justify-between border-b border-border/40 px-6">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Admin Portal
          </h2>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
        >
          {isCollapsed ? (
            <Menu className="h-4 w-4" />
          ) : (
            <X className="h-4 w-4" />
          )}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavItemComponent key={item.title} item={item} isCollapsed={isCollapsed} />
          ))}
        </nav>
      </div>
    </aside>
  )
}
