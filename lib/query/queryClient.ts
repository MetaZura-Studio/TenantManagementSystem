"use client"

import { QueryClient } from "@tanstack/react-query"

// Create a singleton query client instance
let queryClientInstance: QueryClient | undefined

export function getQueryClient(): QueryClient {
  if (!queryClientInstance) {
    queryClientInstance = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
        },
      },
    })
  }
  return queryClientInstance
}

// For backward compatibility
export const queryClient = getQueryClient()
