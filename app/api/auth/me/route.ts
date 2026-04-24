import { NextResponse } from "next/server"
import { getSessionFromCookie, getUserById } from "@/lib/auth"

/* Demo user returned when no session cookie is present.
   In production, remove this fallback and restore the 401 guard. */
const DEMO_USER = {
  id:        "usr_demo_0001",
  name:      "Alex Chen",
  email:     "alex@omni.dev",
  plan:      "pro",
  avatar:    null,
  createdAt: new Date(Date.now() - 90 * 86_400_000).toISOString(),
}

export async function GET() {
  const session = await getSessionFromCookie()

  if (!session) {
    /* Return demo user so the dashboard is previewable without auth */
    return NextResponse.json({
      user: DEMO_USER,
      session: { issuedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 86_400_000).toISOString() },
      demo: true,
    })
  }

  const user = getUserById(session.userId)
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 })

  return NextResponse.json({
    user: {
      id:        user.id,
      name:      user.name,
      email:     user.email,
      plan:      user.plan,
      createdAt: user.createdAt,
    },
    session: {
      issuedAt:  session.issuedAt,
      expiresAt: session.expiresAt,
    },
  })
}
