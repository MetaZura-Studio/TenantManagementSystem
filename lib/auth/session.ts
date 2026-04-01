// Session management
export interface Session {
  user: {
    id: string
    name: string
    email: string
    role: string
    permissions?: string[]
  }
}

const CLIENT_SESSION_KEY = "tms_client_session"

/**
 * Synchronous getter kept for backward compatibility.
 *
 * Important: This does NOT read the httpOnly cookie.
 * For real session state, use `fetchSession()` / `useSession()`.
 */
export function getSession(): Session {
  if (typeof window === "undefined") {
    // Server components should not rely on this.
    return {
      user: { id: "anonymous", name: "Anonymous", email: "", role: "anonymous" },
    }
  }

  try {
    const raw = window.localStorage.getItem(CLIENT_SESSION_KEY)
    if (!raw) {
      return {
        user: { id: "anonymous", name: "Anonymous", email: "", role: "anonymous" },
      }
    }
    return JSON.parse(raw) as Session
  } catch {
    return {
      user: { id: "anonymous", name: "Anonymous", email: "", role: "anonymous" },
    }
  }
}

export async function fetchSession(): Promise<Session | null> {
  const res = await fetch("/api/auth/me", { method: "GET" })
  if (!res.ok) return null
  const data = (await res.json()) as { user: Session["user"] }
  return { user: data.user }
}

export function setClientSession(session: Session | null) {
  if (typeof window === "undefined") return
  if (!session) {
    window.localStorage.removeItem(CLIENT_SESSION_KEY)
    return
  }
  window.localStorage.setItem(CLIENT_SESSION_KEY, JSON.stringify(session))
}

export async function logout(): Promise<void> {
  try {
    await fetch("/api/auth/logout", { method: "POST" })
  } finally {
    setClientSession(null)
  }
}

