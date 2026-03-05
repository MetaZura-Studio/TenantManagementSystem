"use client"

import { Search, Bell, User } from "lucide-react"
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

export function Topbar() {
  return (
    <div className="flex h-16 items-center justify-between border-b border-border/40 bg-background/80 backdrop-blur-xl px-6">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            className={cn(
              "w-64 rounded-full border border-border/50 bg-background/50 backdrop-blur-sm pl-10 pr-4 py-2.5 text-sm",
              "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50",
              "transition-all placeholder:text-muted-foreground/60"
            )}
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-muted/50 transition-colors"
        >
          <Bell className="h-5 w-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 rounded-full hover:bg-muted/50 transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <span className="font-medium">Admin User</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 rounded-xl border-border/50 bg-background/95 backdrop-blur-xl"
          >
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="rounded-lg">Profile</DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg">Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="rounded-lg text-destructive">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
