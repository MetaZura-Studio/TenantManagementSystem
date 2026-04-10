"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  ChevronDown,
  ChevronRight,
  Menu,
  X,
} from "lucide-react"
import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import { navItems, type NavItem } from "./NavItems"
import { useSession } from "@/lib/auth/useSession"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { logout } from "@/lib/auth/session"

function NavItemComponent({
  item,
  isCollapsed,
  openGroupTitle,
  setOpenGroupTitle,
  onNavigate,
}: {
  item: NavItem
  isCollapsed?: boolean
  openGroupTitle: string | null
  setOpenGroupTitle: (title: string | null) => void
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const router = useRouter()

  const normalize = (p: string) => p.replace(/\/+$/, "") || "/"
  const matchesHref = (nav?: Pick<NavItem, "href" | "excludeActivePaths">) => {
    const href = nav?.href
    if (!href) return false
    const p = normalize(pathname)
    const h = normalize(href)
    const excludes = (nav?.excludeActivePaths ?? []).map(normalize)

    const isExcluded =
      excludes.some((ex) => p === ex) || excludes.some((ex) => ex !== "/" && p.startsWith(`${ex}/`))

    if (isExcluded) return false
    if (h === "/") return p === "/"
    return p === h || p.startsWith(`${h}/`)
  }

  const hasActiveChild = item.children?.some((child) => matchesHref(child)) || false
  const isOpen = openGroupTitle === item.title
  const groupHighlighted = isOpen || hasActiveChild

  const isActive = matchesHref(item) || hasActiveChild

  const IconTile = ({ children }: { children: ReactNode }) => (
    <div
      className={cn(
        "flex items-center justify-center rounded-2xl border border-border/25 bg-white/70 dark:bg-slate-950/55",
        isCollapsed ? "h-10 w-10" : "h-9 w-9",
        (item.children ? groupHighlighted : isActive) && "bg-primary/15 border-primary/25 shadow-sm"
      )}
    >
      {children}
    </div>
  )

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => {
            if (isOpen) {
              setOpenGroupTitle(null)
              return
            }

            // Make the highlight predictable: when switching groups, navigate to the
            // group's first child so only one parent is highlighted (route + UI agree).
            const firstChildHref = item.children?.find((c) => c.href)?.href
            const routeIsInThisGroup = hasActiveChild

            setOpenGroupTitle(item.title)
            if (!routeIsInThisGroup && firstChildHref) {
              router.push(firstChildHref)
              onNavigate?.()
            }
          }}
          className={cn(
            "flex w-full items-center justify-between rounded-2xl text-[13px] font-medium transition-all duration-200 border border-transparent",
            groupHighlighted && "bg-primary/10 text-primary border-primary/20",
            isCollapsed
              ? "justify-center px-0 py-2.5 hover:bg-primary/5 dark:hover:bg-primary/10"
              : "px-3 py-2.5 hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary/20 dark:hover:border-primary/20"
          )}
        >
          <div className={cn("flex items-center", isCollapsed ? "justify-center w-full" : "space-x-3")}>
            <IconTile>
              <item.icon className={cn("h-5 w-5 flex-shrink-0", groupHighlighted && "text-primary")} />
            </IconTile>
            {!isCollapsed ? <span className="truncate">{item.title}</span> : null}
          </div>
          {!isCollapsed && (
            isOpen ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            )
          )}
        </button>
        {isOpen && !isCollapsed && (
          <div className="ml-4 mt-1 space-y-1 pl-2 border-l border-border/20">
            {item.children.map((child) => {
              const childIsActive = matchesHref(child)
              return (
                <Link
                  key={child.href}
                  href={child.href!}
                  onClick={() => {
                    setOpenGroupTitle(item.title)
                    onNavigate?.()
                  }}
                  className={cn(
                    "flex items-center space-x-3 rounded-2xl px-3 py-2 text-[13px] transition-all duration-200 border border-transparent hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary/20 dark:hover:border-primary/20",
                    childIsActive && "bg-primary/10 text-primary font-medium border-primary/20"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center rounded-2xl border border-border/25 bg-white/70 dark:bg-slate-950/55 h-8 w-8",
                      childIsActive && "bg-primary/15 border-primary/25 shadow-sm"
                    )}
                  >
                    <child.icon
                      className={cn("h-4 w-4 flex-shrink-0", childIsActive && "text-primary")}
                    />
                  </div>
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
      onClick={() => onNavigate?.()}
      className={cn(
        "relative group flex items-center rounded-2xl text-[13px] font-medium transition-all duration-200 border border-transparent hover:border-primary/20 dark:hover:border-primary/20",
        isCollapsed ? "justify-center px-0 py-2.5 hover:bg-primary/5 dark:hover:bg-primary/10" : "space-x-3 px-3 py-2.5 hover:bg-primary/5 dark:hover:bg-primary/10",
        isActive && "bg-primary/10 text-primary border-primary/20"
      )}
    >
      {isActive && !isCollapsed ? (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
      ) : null}
      <IconTile>
        <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-primary")} />
      </IconTile>
      {!isCollapsed ? <span className="truncate">{item.title}</span> : null}
    </Link>
  )
}

export function Sidebar({
  variant = "desktop",
  isOpen,
  onClose,
}: {
  variant?: "desktop" | "mobile"
  isOpen?: boolean
  onClose?: () => void
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const router = useRouter()
  const { session } = useSession()
  const [logoError, setLogoError] = useState(false)
  const pathname = usePathname()
  const [openGroupTitle, setOpenGroupTitle] = useState<string | null>(null)

  const normalize = (p: string) => p.replace(/\/+$/, "") || "/"
  const matchesNavHref = (href?: string, excludeActivePaths?: string[]) => {
    if (!href) return false
    const p = normalize(pathname)
    const h = normalize(href)
    const excludes = (excludeActivePaths ?? []).map(normalize)
    const isExcluded = excludes.some((ex) => p === ex) || excludes.some((ex) => ex !== "/" && p.startsWith(`${ex}/`))
    if (isExcluded) return false
    if (h === "/") return p === "/"
    return p === h || p.startsWith(`${h}/`)
  }

  useEffect(() => {
    // If the current route belongs to a group, keep that group open/highlighted.
    const activeGroup =
      navItems.find((it) => it.children?.some((c) => matchesNavHref(c.href, c.excludeActivePaths))) ?? null
    setOpenGroupTitle(activeGroup?.title ?? null)
  }, [pathname])

  async function onLogout() {
    await logout()
    router.replace("/login")
  }

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join("")
    : "A"

  const isMobile = variant === "mobile"
  const show = isMobile ? !!isOpen : true
  const effectiveCollapsed = isMobile ? false : isCollapsed

  if (!show) return null

  return (
    <aside
      style={{ width: effectiveCollapsed ? 72 : 280 }}
      className={cn(
        "relative z-10 flex h-full flex-col transition-all duration-300 flex-shrink-0 p-3",
        isMobile && "fixed left-0 top-0 z-50"
      )}
    >
      {isMobile ? (
        <button
          type="button"
          className="fixed inset-0 bg-black/30 backdrop-blur-[1px]"
          aria-label="Close menu"
          onClick={onClose}
        />
      ) : null}
      <div className="flex h-full flex-col rounded-3xl border border-border/25 bg-white/70 dark:bg-slate-950/65 backdrop-blur-xl shadow-sm overflow-hidden">
        <div className="flex min-h-16 items-start justify-between px-5 py-3">
          {!effectiveCollapsed && (
            <Link
              href="/dashboard"
              className="flex items-start gap-3 rounded-2xl hover:bg-muted/40 transition-colors px-2 py-1"
              aria-label="Go to dashboard"
              onClick={() => onClose?.()}
            >
                <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold overflow-hidden">
                  {!logoError ? (
                    <Image
                      src="/logo-mark.svg"
                      alt="Logo"
                      width={36}
                      height={36}
                      className="h-9 w-9 object-contain"
                      onError={() => setLogoError(true)}
                      priority
                    />
                  ) : (
                    initials
                  )}
                </div>
                <div className="leading-snug max-w-[170px]">
                  <div className="text-sm font-semibold leading-snug whitespace-normal break-words">
                    Dishdasha Management System
                  </div>
                  <div className="text-[11px] text-muted-foreground">Admin Portal</div>
                </div>
            </Link>
          )}
          {isMobile ? (
            <button
              onClick={onClose}
              className="p-2 rounded-2xl hover:bg-muted/50 transition-colors bg-white/40 dark:bg-slate-950/30"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-2xl hover:bg-muted/50 transition-colors bg-white/40 dark:bg-slate-950/30"
              aria-label="Toggle sidebar"
            >
              {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-3">
          {!effectiveCollapsed && (
            <div className="px-2 pb-2 text-[11px] font-semibold text-muted-foreground/80">
              MENU
            </div>
          )}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavItemComponent
                key={item.title}
                item={item}
                isCollapsed={effectiveCollapsed}
                openGroupTitle={openGroupTitle}
                setOpenGroupTitle={setOpenGroupTitle}
                onNavigate={isMobile ? onClose : undefined}
              />
            ))}
          </nav>
        </div>

        <div className="border-t border-border/30 p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "rounded-2xl border border-border/20 bg-white/55 dark:bg-slate-950/60 px-3 py-3 flex items-center gap-3 w-full",
                  effectiveCollapsed && "justify-center flex-col gap-1 px-2 py-2"
                )}
                aria-label="Open account menu"
              >
                <div
                  className={cn(
                    "h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold",
                    effectiveCollapsed && "h-11 w-11"
                  )}
                  aria-hidden
                >
                  {initials}
                </div>

                {!effectiveCollapsed ? (
                  <div className="min-w-0 flex-1 text-left">
                    <div className="text-sm font-semibold truncate">{session?.user?.name || "Admin User"}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{session?.user?.email || "admin@example.com"}</div>
                  </div>
                ) : null}
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-56 rounded-2xl border-border/30 bg-white/90 backdrop-blur-xl dark:border-border/40 dark:bg-slate-950/80"
            >
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem className="rounded-lg" asChild>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="rounded-lg text-destructive"
                onClick={onLogout}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </aside>
  )
}
