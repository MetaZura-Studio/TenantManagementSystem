"use client"

import { useEffect } from "react"
import { seedData } from "@/lib/seed"

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    seedData()
  }, [])

  return <>{children}</>
}
