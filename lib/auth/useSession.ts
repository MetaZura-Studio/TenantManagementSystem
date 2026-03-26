"use client"

import { useEffect, useState } from "react"
import type { Session } from "@/lib/auth/session"
import { fetchSession, setClientSession } from "@/lib/auth/session"

export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const s = await fetchSession()
        if (cancelled) return
        setSession(s)
        setClientSession(s)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return { session, loading }
}

