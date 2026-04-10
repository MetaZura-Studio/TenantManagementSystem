"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { fetchSession, setClientSession } from "@/lib/auth/session"
import { ThemeToggleButton } from "@/components/shared/theme/ThemeToggleButton"

export default function LoginPage() {
  const router = useRouter()
  const search = useSearchParams()
  const next = useMemo(() => search.get("next") || "/dashboard", [search])

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState<"idle" | "submitting" | "redirecting">("idle")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    router.prefetch(next)
  }, [router, next])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setStatus("submitting")
    try {
      const controller = new AbortController()
      const t = window.setTimeout(() => controller.abort(), 15000)

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      })
      window.clearTimeout(t)
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as any
        setError(data?.error?.message || "Login failed")
        setStatus("idle")
        return
      }
      // Immediately show "redirecting" feedback and navigate.
      // Use a hard navigation to avoid a race where Set-Cookie hasn't been
      // applied yet, causing middleware to bounce back to /login.
      setStatus("redirecting")
      fetchSession()
        .then((session) => setClientSession(session))
        .catch(() => {
          // ignore: dashboard/server routes rely on httpOnly cookie anyway
        })
        .finally(() => {
          window.location.assign(next)
        })
    } catch (err: any) {
      const msg =
        err?.name === "AbortError"
          ? "Login is taking too long. Please try again."
          : err?.message || "Login failed"
      setError(msg)
      setStatus("idle")
    } finally {
      // Intentionally do not set status back to idle on success.
      // If navigation fails, user can refresh and retry.
    }
  }

  const isBusy = status !== "idle"

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#eef6ff] via-[#f7fbff] to-[#eaf2ff] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-50">
      {/* background blobs + subtle pattern (match AppShell vibe) */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-sky-200/50 blur-3xl dark:bg-sky-400/20" />
        <div className="absolute -bottom-48 -right-48 h-[620px] w-[620px] rounded-full bg-indigo-200/40 blur-3xl dark:bg-indigo-500/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.10),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.10),transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.05] [background-image:radial-gradient(rgba(15,23,42,0.9)_1px,transparent_1px)] dark:[background-image:radial-gradient(rgba(226,232,240,0.9)_1px,transparent_1px)] [background-size:18px_18px]" />
      </div>

      {/* minimal app name watermark */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-6 sm:top-8 -translate-x-1/2 text-center select-none"
      >
        <div
          className={`
            text-[64px] sm:text-[88px] font-semibold tracking-tight whitespace-nowrap
            text-transparent bg-clip-text
            bg-gradient-to-b from-blue-700/20 via-indigo-600/12 to-sky-500/10
            dark:from-sky-200/16 dark:via-blue-300/12 dark:to-sky-100/10
            drop-shadow-[0_1px_0_rgba(255,255,255,0.18)]
            dark:drop-shadow-[0_1px_0_rgba(0,0,0,0.35)]
          `}
        >
          Dishdasha
        </div>
        <div
          className={`
            -mt-4 text-[26px] sm:text-[32px] font-semibold tracking-tight whitespace-nowrap
            text-transparent bg-clip-text
            bg-gradient-to-b from-blue-700/16 via-indigo-600/10 to-sky-500/9
            dark:from-sky-200/14 dark:via-blue-300/10 dark:to-sky-100/10
            drop-shadow-[0_1px_0_rgba(255,255,255,0.16)]
            dark:drop-shadow-[0_1px_0_rgba(0,0,0,0.35)]
          `}
        >
          Management System
        </div>
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-[460px]">
          <div className="rounded-[28px] border border-slate-200/60 bg-white/70 dark:bg-slate-950/55 dark:border-white/10 shadow-xl shadow-slate-900/10 backdrop-blur-2xl overflow-hidden">
            <div className="p-8 sm:p-9">
              <div className="relative mb-2">
                <ThemeToggleButton
                  className="absolute right-0 top-0 rounded-2xl bg-white/60 backdrop-blur-xl border border-border/30 hover:bg-white/70 transition-colors
                  dark:bg-slate-950/45 dark:border-white/10 dark:hover:bg-slate-950/55"
                />
              </div>

              <div className="mb-7">
                <div className="text-sm text-slate-600 dark:text-slate-300/70">Welcome back</div>
                <h1 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight">
                  Sign in to Admin Portal
                </h1>
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Email</label>
                  <div className="rounded-2xl border border-slate-200/70 bg-white/60 dark:bg-slate-950/40 dark:border-white/10 focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/15 transition">
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      placeholder="Enter your email"
                      disabled={isBusy}
                      className="h-12 border-0 bg-transparent text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-400/60 focus-visible:ring-0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Password</label>
                  <div className="rounded-2xl border border-slate-200/70 bg-white/60 dark:bg-slate-950/40 dark:border-white/10 focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/15 transition">
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      disabled={isBusy}
                      className="h-12 border-0 bg-transparent text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-400/60 focus-visible:ring-0"
                    />
                  </div>
                </div>

                {error ? (
                  <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                ) : null}

                <Button
                  type="submit"
                  className="w-full h-12 rounded-2xl bg-gradient-to-b from-blue-500 to-blue-600 text-white hover:from-blue-500 hover:to-blue-700 shadow-lg shadow-blue-600/20 active:scale-[0.99]"
                  disabled={isBusy}
                >
                  {isBusy ? (
                    <span className="inline-flex items-center justify-center">
                      <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                      {status === "redirecting" ? "Redirecting..." : "Signing in..."}
                    </span>
                  ) : (
                    "Sign in"
                  )}
                </Button>

                {status === "redirecting" ? (
                  <div className="text-xs text-slate-500 dark:text-slate-300/60 text-center">
                    Opening your dashboard…
                  </div>
                ) : null}

                <div className="pt-2 text-xs text-slate-500 dark:text-slate-300/60 text-center">
                  By signing in, you agree to our Terms & Service.
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

