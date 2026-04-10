"use client"

import { ThemeToggleButton } from "@/components/shared/theme/ThemeToggleButton"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export function Topbar({ onOpenSidebar }: { onOpenSidebar?: () => void }) {
  return (
    <div className="relative z-10 flex h-16 items-center justify-between px-8">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden rounded-2xl bg-white/60 backdrop-blur-xl border border-border/20 hover:bg-white/70 transition-colors dark:bg-slate-950/45 dark:border-border/30 dark:hover:bg-slate-950/55"
          onClick={onOpenSidebar}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggleButton
          className="rounded-2xl bg-white/60 backdrop-blur-xl border border-border/20 hover:bg-white/70 transition-colors
          dark:bg-slate-950/45 dark:border-border/30 dark:hover:bg-slate-950/55"
        />
      </div>
    </div>
  )
}
