"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchSession, setClientSession } from "@/lib/auth/session"

export default function LoginPage() {
  const router = useRouter()
  const search = useSearchParams()
  const next = useMemo(() => search.get("next") || "/dashboard", [search])

  const [email, setEmail] = useState("admin@example.com")
  const [password, setPassword] = useState("admin123")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as any
        setError(data?.error?.message || "Login failed")
        return
      }
      // Populate client-side session so existing synchronous permission checks
      // (used in some pages) can start enforcing.
      const session = await fetchSession()
      setClientSession(session)
      router.replace(next)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Dev password defaults to admin123 (override via ADMIN_PASSWORD env var).
            </p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Dev test emails:</p>
              <ul className="list-disc pl-5">
                <li>admin@example.com</li>
                <li>viewer@example.com</li>
                <li>tenant.manager@example.com</li>
                <li>commercial.manager@example.com</li>
                <li>user.manager@example.com</li>
                <li>finance.manager@example.com</li>
              </ul>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

