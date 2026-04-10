import { Skeletons } from "@/components/shared/feedback/Skeletons"
import { cn } from "@/lib/utils"

export function TableSkeleton({
  rows = 8,
  cols = 6,
  className,
}: {
  rows?: number
  cols?: number
  className?: string
}) {
  const colArr = Array.from({ length: cols })
  const rowArr = Array.from({ length: rows })

  return (
    <div className={cn("p-4", className)}>
      <div className="rounded-xl border border-border/50 overflow-hidden bg-background/50 backdrop-blur-sm">
        <div className="p-3 border-b border-border/40 bg-muted/20">
          <div className="flex items-center gap-3">
            {colArr.slice(0, Math.min(4, cols)).map((_, i) => (
              <Skeletons key={i} className={cn("h-4", i === 0 ? "w-28" : "w-20")} />
            ))}
          </div>
        </div>
        <div className="divide-y divide-border/30">
          {rowArr.map((_, r) => (
            <div key={r} className="flex items-center gap-3 p-3">
              {colArr.map((_, c) => (
                <Skeletons
                  key={c}
                  className={cn(
                    "h-4",
                    c === 0 ? "w-28" : c === 1 ? "w-40" : c === cols - 1 ? "w-24" : "w-32"
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

