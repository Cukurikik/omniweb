import { NextResponse } from "next/server"
import { getSessionFromCookie, getUserById } from "@/lib/auth"


export async function GET() {
  const session = await getSessionFromCookie()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
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
