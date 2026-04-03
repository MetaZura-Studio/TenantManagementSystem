"use client"

import React from "react"
import { Sidebar } from "./Sidebar"
import { Topbar } from "./Topbar"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-[#eef6ff]">
      {/* soft background blobs (like the reference UI) */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-sky-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-48 -right-48 h-[620px] w-[620px] rounded-full bg-indigo-200/40 blur-3xl" />

      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-8 pb-10 pt-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
