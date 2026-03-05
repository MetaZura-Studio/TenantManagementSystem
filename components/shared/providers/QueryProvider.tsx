"use client"

import React, { useState } from "react"
import { QueryClientProvider as TanStackQueryClientProvider } from "@tanstack/react-query"
import { getQueryClient } from "@/lib/query/queryClient"

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => getQueryClient())
  return (
    <TanStackQueryClientProvider client={queryClient}>
      {children}
    </TanStackQueryClientProvider>
  )
}
