"use client"

import React, { useState } from "react"
import { Sidebar } from "./Sidebar"
import { Topbar } from "./Topbar"

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-gradient-to-br from-[#eef6ff] via-[#f7fbff] to-[#eaf2ff] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* soft background blobs (like the reference UI) */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-sky-200/50 blur-3xl dark:bg-sky-400/20" />
      <div className="pointer-events-none absolute -bottom-48 -right-48 h-[620px] w-[620px] rounded-full bg-indigo-200/40 blur-3xl dark:bg-indigo-500/20" />

      <div className="hidden md:block">
        <Sidebar variant="desktop" />
      </div>
      <div className="md:hidden">
        <Sidebar variant="mobile" isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Topbar onOpenSidebar={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto px-8 pb-10 pt-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
