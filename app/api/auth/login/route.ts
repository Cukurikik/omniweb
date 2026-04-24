import { NextRequest, NextResponse } from "next/server"
import {
  getUserByEmail, verifyPassword,
  createSessionToken, setSessionCookie,
} from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password)
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 })

    const norm = email.toLowerCase().trim()
    const user = await getUserByEmail(norm)

    const valid = user
      ? await verifyPassword(password, user.password_hash)
      : (await verifyPassword(password, "$2a$12$invalidhashplaceholderforconstanttime"), false)

    if (!user || !valid)
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 })

    const token = await createSessionToken(user)
    await setSessionCookie(token)

    return NextResponse.json({
      ok: true,
      user: { id: user.id, name: user.name, email: user.email, plan: user.plan },
    })

  } catch (err) {
    console.error("[api/auth/login]", err)
    return NextResponse.json({ error: "Internal server error." }, { status: 500 })
  }
}
