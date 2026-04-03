"use client"

import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/shared/cards"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChevronRight, MoreHorizontal, Phone, Send } from "lucide-react"
import Link from "next/link"

export function KpiNavCard({
  title,
  subtitle,
  items,
}: {
  title: string
  subtitle?: string
  items: Array<{
    label: string
    value: string
    href: string
    hint?: string
  }>
}) {
  return (
    <GlassCard variant="elevated" className="rounded-3xl overflow-hidden">
      <GlassCardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <GlassCardTitle className="text-lg">{title}</GlassCardTitle>
            {subtitle ? (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            ) : null}
          </div>
          <Button variant="ghost" size="icon" className="rounded-2xl">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </GlassCardHeader>
      <GlassCardContent className="pt-2">
        <div className="space-y-3">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className="group flex items-center justify-between rounded-2xl border border-border/30 bg-white/50 px-4 py-3 hover:bg-white/70 transition-colors"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{it.label}</div>
                {it.hint ? (
                  <div className="text-xs text-muted-foreground truncate mt-0.5">
                    {it.hint}
                  </div>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold">{it.value}</div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </GlassCardContent>
    </GlassCard>
  )
}

function WorldMapLite({
  pins = [],
}: {
  pins?: Array<{ x: number; y: number; color: string; label: string }>
}) {
  // lightweight “map canvas” with real pins, no extra deps
  return (
    <svg viewBox="0 0 640 320" className="h-44 w-full">
      <defs>
        <linearGradient id="land" x1="0" x2="1">
          <stop offset="0" stopColor="rgba(59,130,246,0.35)" />
          <stop offset="1" stopColor="rgba(99,102,241,0.30)" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="640" height="320" rx="18" fill="rgba(255,255,255,0.35)" />
      {/* soft “continents” backdrop */}
      <path d="M90 110c40-40 120-55 170-20 30 22 34 75-10 93-40 16-110 25-155-12-30-25-25-42-5-61z" fill="url(#land)" />
      <path d="M300 90c35-30 85-45 130-30 55 18 72 64 40 92-35 30-95 42-145 20-45-20-55-55-25-82z" fill="url(#land)" />
      <path d="M430 150c30-18 80-20 110 0 35 22 28 68-12 82-38 14-92 8-118-18-22-22-12-50 20-64z" fill="url(#land)" />

      {/* real pins (computed server-side from tenant country) */}
      {pins.map((p) => (
        <g key={p.label}>
          <circle cx={p.x} cy={p.y} r="9" fill="rgba(255,255,255,0.85)" />
          <circle cx={p.x} cy={p.y} r="6" fill={p.color} />
        </g>
      ))}
    </svg>
  )
}

export function DemographicCard({
  rows,
  pins = [],
}: {
  rows: Array<{ label: string; value: number }>
  pins?: Array<{ x: number; y: number; color: string; label: string }>
}) {
  const palette = ["bg-blue-600", "bg-emerald-500", "bg-orange-500", "bg-violet-500"] as const
  const pinPalette = ["#2563eb", "#10b981", "#f97316", "#a855f7"] as const
  const normalized = (rows || []).map((r, i) => ({
    ...r,
    color: palette[i % palette.length],
    pinColor: pinPalette[i % pinPalette.length],
  }))

  return (
    <GlassCard variant="elevated" className="rounded-3xl overflow-hidden">
      <GlassCardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <GlassCardTitle className="text-lg">Demographic</GlassCardTitle>
            <p className="text-xs text-muted-foreground mt-1">Top tenant countries (live)</p>
          </div>
          <Button variant="ghost" size="icon" className="rounded-2xl">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </GlassCardHeader>
      <GlassCardContent className="pt-2 space-y-4">
        <WorldMapLite pins={pins} />
        <div className="grid grid-cols-2 gap-3">
          {normalized.map((r) => (
            <div
              key={r.label}
              className="flex items-center gap-2 rounded-2xl border border-border/30 bg-white/50 px-3 py-2"
            >
              <span className={cn("h-2.5 w-2.5 rounded-full", r.color)} />
              <div className="text-xs text-muted-foreground truncate">{r.label}</div>
              <div className="ml-auto text-xs font-semibold">{String(r.value)}</div>
            </div>
          ))}
        </div>
      </GlassCardContent>
    </GlassCard>
  )
}

export function ChatRequestCard({
  title = "Recent Activity",
  items,
}: {
  title?: string
  items: Array<{ name: string; msg: string; time: string }>
}) {

  return (
    <GlassCard variant="elevated" className="rounded-3xl overflow-hidden">
      <GlassCardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <GlassCardTitle className="text-lg">{title}</GlassCardTitle>
          <Button variant="ghost" size="icon" className="rounded-2xl">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </GlassCardHeader>
      <GlassCardContent className="pt-2">
        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="text-sm text-muted-foreground px-2 py-6 text-center">
              No recent activity yet.
            </div>
          ) : (
            items.map((it, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 rounded-2xl border border-border/30 bg-white/55 px-3 py-3"
              >
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-500 text-white flex items-center justify-center font-semibold">
                  {it.name.slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold truncate">{it.name}</div>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {it.msg}
                  </div>
                  <div className="text-[11px] text-muted-foreground/80 mt-1">
                    {it.time}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-2xl hover:bg-white/70"
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-2xl hover:bg-white/70"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCardContent>
    </GlassCard>
  )
}

