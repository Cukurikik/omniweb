import { NextResponse } from "next/server"
import { getSessionFromCookie, getUserById } from "@/lib/auth"

export async function GET() {
  const session = await getSessionFromCookie()

  if (!session) {
    return NextResponse.json({ error: "Unauthenticated." }, { status: 401 })
  }

  const user = await getUserById(session.userId)
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 })

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      avatar_url: user.avatar_url ?? null,
      created_at: user.created_at,
    },
    session: {
      issuedAt: session.issuedAt,
      expiresAt: session.expiresAt,
    },
  })
}
