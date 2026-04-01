import { NextResponse, type NextRequest } from "next/server"

const PUBLIC_FILE = /\.(.*)$/

function isPublicPath(pathname: string) {
  if (pathname === "/login") return true
  if (pathname.startsWith("/api/auth/")) return true
  if (pathname.startsWith("/_next")) return true
  if (pathname.startsWith("/favicon")) return true
  if (PUBLIC_FILE.test(pathname)) return true
  return false
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const hasSession = Boolean(req.cookies.get("tms_session")?.value)

  // If user is already authenticated, keep them out of /login.
  if (pathname === "/login" && hasSession) {
    const url = req.nextUrl.clone()
    url.pathname = req.nextUrl.searchParams.get("next") || "/dashboard"
    url.search = ""
    return NextResponse.redirect(url)
  }

  if (isPublicPath(pathname)) return NextResponse.next()

  // Only protect "page" routes; let other API routes enforce via Dev1 helpers.
  if (pathname.startsWith("/api/")) return NextResponse.next()

  if (hasSession) return NextResponse.next()

  const url = req.nextUrl.clone()
  url.pathname = "/login"
  url.searchParams.set("next", pathname)
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
}

