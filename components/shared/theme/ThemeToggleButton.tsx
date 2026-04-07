"use client"

import { Moon, SunMedium } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggleButton({
  variant = "ghost",
  className,
}: {
  variant?: "ghost" | "outline" | "default"
  className?: string
}) {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      type="button"
      variant={variant as any}
      size="icon"
      className={className}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      <SunMedium className="h-5 w-5 text-amber-500 dark:hidden" />
      <Moon className="h-5 w-5 text-sky-300 hidden dark:block" />
    </Button>
  )
}

