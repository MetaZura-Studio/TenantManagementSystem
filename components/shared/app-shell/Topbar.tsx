"use client"

import { Search, Bell, Settings, User } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { logout } from "@/lib/auth/session"

export function Topbar() {
  const router = useRouter()

  async function onLogout() {
    await logout()
    router.replace("/login")
  }

  return (
    <div className="relative z-10 flex h-16 items-center justify-between px-8">
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            className={cn(
              "w-[360px] rounded-2xl border border-border/30 bg-white/70 backdrop-blur-xl pl-10 pr-4 py-2.5 text-sm shadow-sm",
              "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40",
              "transition-all placeholder:text-muted-foreground/70"
            )}
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-2xl bg-white/60 backdrop-blur-xl border border-border/20 hover:bg-white/70 transition-colors"
        >
          <Settings className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-2xl bg-white/60 backdrop-blur-xl border border-border/20 hover:bg-white/70 transition-colors"
        >
          <Bell className="h-5 w-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 rounded-2xl bg-white/60 backdrop-blur-xl border border-border/20 hover:bg-white/70 transition-colors"
            >
              <div className="h-8 w-8 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <span className="font-medium hidden sm:inline">Admin User</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 rounded-2xl border-border/30 bg-white/90 backdrop-blur-xl"
          >
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="rounded-lg">Profile</DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg">Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="rounded-lg text-destructive" onClick={onLogout}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
