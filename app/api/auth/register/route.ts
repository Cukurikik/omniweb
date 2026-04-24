import { NextRequest, NextResponse } from "next/server"
import {
  getUserByEmail, createUser,
  createSessionToken, setSessionCookie,
} from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!name?.trim())
      return NextResponse.json({ error: "Name is required." }, { status: 400 })
    if (!email?.includes("@"))
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 })
    if (!password || password.length < 8)
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 })

    const norm = email.toLowerCase().trim()

    const existing = await getUserByEmail(norm)
    if (existing)
      return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 })

    const user = await createUser({
      name: name.trim(),
      email: norm,
      password,
      plan: "community",
    })

    const token = await createSessionToken(user)
    await setSessionCookie(token)

    return NextResponse.json({
      ok: true,
      user: { id: user.id, name: user.name, email: user.email, plan: user.plan, created_at: user.created_at },
    }, { status: 201 })

  } catch (err) {
    console.error("[api/auth/register]", err)
    return NextResponse.json({ error: "Internal server error." }, { status: 500 })
  }
}
