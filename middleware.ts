import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const SESSION_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "omni_dev_secret_2025_change_in_production"
)

const PROTECTED = ["/dashboard"]
const AUTH_ONLY = ["/login", "/register"]

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
  const token = req.cookies.get("omni_session")?.value ?? ""
  const isAuth = token ? await verifyToken(token) : false

  const isProtected = PROTECTED.some(p => pathname.startsWith(p))
  const isAuthOnly = AUTH_ONLY.some(p => pathname.startsWith(p))

  if (isProtected && !isAuth) {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  if (isAuthOnly && isAuth) {
    const url = req.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/login", "/register", "/dashboard/:path*"],
}
