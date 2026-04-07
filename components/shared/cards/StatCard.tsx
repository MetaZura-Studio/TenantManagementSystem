import * as React from "react"
import { cn } from "@/lib/utils"
import { GlassCard, GlassCardContent } from "./GlassCard"
import { LucideIcon } from "lucide-react"

interface ModernStatCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  tone?: "orange" | "blue" | "cyan" | "green" | "violet" | "slate"
  trend?: {
    value: string
    isPositive: boolean
  }
  className?: string
}

const TONE_STYLES: Record<
  NonNullable<ModernStatCardProps["tone"]>,
  { bg: string; icon: string; glow: string }
> = {
  orange: {
    bg: "bg-gradient-to-br from-orange-500 to-amber-400",
    icon: "text-orange-700",
    glow: "shadow-[0_12px_30px_-18px_rgba(249,115,22,0.55)]",
  },
  blue: {
    bg: "bg-gradient-to-br from-blue-600 to-indigo-500",
    icon: "text-blue-700",
    glow: "shadow-[0_12px_30px_-18px_rgba(37,99,235,0.55)]",
  },
  cyan: {
    bg: "bg-gradient-to-br from-cyan-500 to-sky-400",
    icon: "text-cyan-700",
    glow: "shadow-[0_12px_30px_-18px_rgba(6,182,212,0.55)]",
  },
  green: {
    bg: "bg-gradient-to-br from-emerald-500 to-lime-400",
    icon: "text-emerald-700",
    glow: "shadow-[0_12px_30px_-18px_rgba(16,185,129,0.55)]",
  },
  violet: {
    bg: "bg-gradient-to-br from-violet-600 to-fuchsia-500",
    icon: "text-violet-700",
    glow: "shadow-[0_12px_30px_-18px_rgba(124,58,237,0.55)]",
  },
  slate: {
    bg: "bg-gradient-to-br from-slate-600 to-slate-500",
    icon: "text-slate-700",
    glow: "shadow-[0_12px_30px_-18px_rgba(71,85,105,0.55)]",
  },
}

export function ModernStatCard({
  title,
  value,
  description,
  icon: Icon,
  tone = "blue",
  trend,
  className,
}: ModernStatCardProps) {
  const t = TONE_STYLES[tone]
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-[1px] w-full min-h-[190px] h-full",
        t.glow,
        className
      )}
    >
      <div className={cn("relative rounded-2xl p-6 text-white h-full flex flex-col justify-between", t.bg)}>
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

        <div className="relative flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <p className="text-sm font-semibold text-white/85">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold tracking-tight">{value}</p>
              {trend && (
                <span className="text-sm font-semibold text-white/90">
                  {trend.isPositive ? "↑" : "↓"} {trend.value}
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-white/80">{description}</p>
            )}
          </div>
          {Icon && (
            <div className="h-10 w-10 rounded-2xl bg-white/25 backdrop-blur-sm flex items-center justify-center">
              <Icon className="h-5 w-5 text-white" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
