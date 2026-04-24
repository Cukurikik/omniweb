import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const SESSION_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "omni_dev_secret_2025_change_in_production"
)
const COOKIE_NAME = "omni_session"

const AUTH_ONLY = ["/login", "/register"]
const PROTECTED = ["/dashboard"]

async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, SESSION_SECRET)
    return true
  } catch {
    return false
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get(COOKIE_NAME)?.value ?? ""

  const isAuthOnly = AUTH_ONLY.some(p => pathname.startsWith(p))
  const isProtected = PROTECTED.some(p => pathname.startsWith(p))

  /* Authenticated user visiting login/register -> redirect to dashboard */
  if (isAuthOnly && token && await verifyToken(token)) {
    const url = req.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  /* Unauthenticated user visiting protected routes -> redirect to login */
  if (isProtected && (!token || !(await verifyToken(token)))) {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/login", "/register", "/dashboard/:path*"],
}
