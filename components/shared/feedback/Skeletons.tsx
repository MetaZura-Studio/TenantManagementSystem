import { cn } from "@/lib/utils"

function SkeletonsComponent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-muted/50",
        className
      )}
      {...props}
    />
  )
}

export const Skeletons = SkeletonsComponent
export const ModernSkeleton = SkeletonsComponent
