import { NextRequest, NextResponse } from "next/server"
import {
  getUserByEmail, verifyPassword,
  createSessionToken, SESSION_TTL, COOKIE_NAME,
} from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password)
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 })

    const norm = email.toLowerCase().trim()
    const user = getUserByEmail(norm)

    /* Constant-time-ish: always verify to avoid timing oracle */
    const valid = user
      ? await verifyPassword(password, user.passwordHash)
      : (await verifyPassword(password, "x"), false)

    if (!user || !valid)
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 })

    const token = createSessionToken(user)

    /* Set the cookie directly on the response so it works in all environments */
    const res = NextResponse.json({
      ok:   true,
      user: { id: user.id, name: user.name, email: user.email, plan: user.plan },
    })
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: false,          // must be false so middleware can read it in the preview runtime
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:   Math.floor(SESSION_TTL / 1000),
      path:     "/",
    })
    return res

  } catch (err) {
    console.error("[api/auth/login]", err)
    return NextResponse.json({ error: "Internal server error." }, { status: 500 })
  }
}
