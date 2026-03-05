import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 backdrop-blur-sm",
  {
    variants: {
      variant: {
        default:
          "border-primary/20 bg-primary/10 text-primary hover:bg-primary/20",
        secondary:
          "border-border/50 bg-muted/50 text-muted-foreground hover:bg-muted",
        destructive:
          "border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20",
        outline: "border-border/50 text-foreground bg-background/50",
        success: "border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20",
        warning: "border-orange-500/20 bg-orange-500/10 text-orange-700 dark:text-orange-400 hover:bg-orange-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
