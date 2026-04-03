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
import { logout } from "@/lib/auth/session"
import { useRouter } from "next/navigation"

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
  const router = useRouter()

  async function onLogout() {
    await logout()
    router.replace("/login")
  }

  return (
    <aside
      style={{ width: isCollapsed ? 80 : 256 }}
      className="relative z-10 flex h-full flex-col transition-all duration-300 flex-shrink-0 p-4"
    >
      <div className="flex h-full flex-col rounded-3xl border border-border/30 bg-white/70 backdrop-blur-xl shadow-sm overflow-hidden">
        <div className="flex h-16 items-center justify-between px-5">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold">
                A
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold">Admin Portal</div>
                <div className="text-[11px] text-muted-foreground">Tenant Management</div>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-2xl hover:bg-muted/40 transition-colors"
            aria-label="Toggle sidebar"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-3">
          {!isCollapsed && (
            <div className="px-2 pb-2 text-[11px] font-semibold text-muted-foreground/80">
              MENU
            </div>
          )}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavItemComponent key={item.title} item={item} isCollapsed={isCollapsed} />
            ))}
          </nav>
        </div>

        <div className="border-t border-border/30 p-3">
          {!isCollapsed && (
            <div className="px-2 pb-2 text-[11px] font-semibold text-muted-foreground/80">
              SUPPORT
            </div>
          )}
          <button
            onClick={onLogout}
            className={cn(
              "flex w-full items-center space-x-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-muted/50",
              "text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="h-5 w-5 flex items-center justify-center">⎋</span>
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  )
}
