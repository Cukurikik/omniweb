import { NextRequest, NextResponse } from "next/server"
import {
  getUserByEmail, createUser,
  createSessionToken, SESSION_TTL, COOKIE_NAME,
} from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    /* ── validation ── */
    if (!name?.trim())            return NextResponse.json({ error: "Name is required." }, { status: 400 })
    if (!email?.includes("@"))    return NextResponse.json({ error: "Invalid email address." }, { status: 400 })
    if (!password || password.length < 8)
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 })

    const norm = email.toLowerCase().trim()

    /* ── duplicate check ── */
    const existing = await getUserByEmail(norm)
    if (existing)
      return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 })

    /* ── create user (bcrypt hashing happens inside createUser) ── */
    const user = await createUser({
      name: name.trim(),
      email: norm,
      password,
      plan: "community",
    })

    /* ── create session ── */
    const token = await createSessionToken(user)
    const res = NextResponse.json({
      ok: true,
      user: { id: user.id, name: user.name, email: user.email, plan: user.plan, created_at: user.created_at },
    }, { status: 201 })
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: Math.floor(SESSION_TTL / 1000),
      path: "/",
    })
    return res

  } catch (err) {
    console.error("[api/auth/register]", err)
    return NextResponse.json({ error: "Internal server error." }, { status: 500 })
  }
}
