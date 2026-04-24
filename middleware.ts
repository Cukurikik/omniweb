import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/*
 * Auth is enforced client-side inside the dashboard layout.
 * The middleware only redirects already-authenticated users away from
 * login/register so they land on the dashboard immediately.
 */
const AUTH_ONLY = ["/login", "/register"]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get("omni_session")?.value ?? ""

  const isAuthOnly = AUTH_ONLY.some(p => pathname.startsWith(p))

  /* Authenticated user visiting login/register → go to dashboard */
  if (isAuthOnly && token) {
    const url = req.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/login", "/register"],
}
