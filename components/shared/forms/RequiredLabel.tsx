import * as React from "react"

import { cn } from "@/lib/utils"
import { FormLabel } from "@/components/ui/form"

type RequiredLabelProps = React.ComponentPropsWithoutRef<typeof FormLabel> & {
  required?: boolean
}

export function RequiredLabel({
  required = true,
  className,
  children,
  ...props
}: RequiredLabelProps) {
  return (
    <FormLabel className={cn("inline-flex items-center gap-1", className)} {...props}>
      <span>{children}</span>
      {required ? (
        <span className="text-destructive" aria-hidden="true">
          *
        </span>
      ) : null}
    </FormLabel>
  )
}

