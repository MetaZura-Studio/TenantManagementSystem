import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cva, type VariantProps } from "class-variance-authority"

const glassCardVariants = cva(
  "backdrop-blur-xl border transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-white/70 dark:bg-gray-900/70 border-gray-200/50 dark:border-gray-800/50 shadow-lg",
        elevated: "bg-white/80 dark:bg-gray-900/80 border-gray-200/60 dark:border-gray-800/60 shadow-xl",
        subtle: "bg-white/60 dark:bg-gray-900/60 border-gray-200/40 dark:border-gray-800/40 shadow-md",
        interactive: "bg-white/70 dark:bg-gray-900/70 border-gray-200/50 dark:border-gray-800/50 shadow-lg hover:bg-white/80 dark:hover:bg-gray-900/80 hover:shadow-xl hover:border-gray-300/60 dark:hover:border-gray-700/60 cursor-pointer",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {
  asChild?: boolean
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(glassCardVariants({ variant }), className)}
        {...props}
      />
    )
  }
)
GlassCard.displayName = "GlassCard"

const GlassCardHeader = CardHeader
const GlassCardTitle = CardTitle
const GlassCardDescription = CardDescription
const GlassCardContent = CardContent
const GlassCardFooter = CardFooter

export {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardDescription,
  GlassCardContent,
  GlassCardFooter,
}
