"use client"

import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggleButton } from "@/components/shared/theme/ThemeToggleButton"

export function Topbar() {
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
              "dark:border-border/50 dark:bg-slate-950/55 dark:text-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40",
              "transition-all placeholder:text-muted-foreground/70"
            )}
          />
        </div>
        <ThemeToggleButton
          className="rounded-2xl bg-white/60 backdrop-blur-xl border border-border/20 hover:bg-white/70 transition-colors
          dark:bg-slate-950/45 dark:border-border/30 dark:hover:bg-slate-950/55"
        />
      </div>
    </div>
  )
}
