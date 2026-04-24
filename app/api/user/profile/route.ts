import { NextRequest, NextResponse } from "next/server"
import { getSessionFromCookie, getUserById, getUserByEmail } from "@/lib/auth"

export async function GET() {
  const session = await getSessionFromCookie()
  if (!session) return NextResponse.json({ error: "Unauthenticated." }, { status: 401 })
  const user = getUserById(session.userId)
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 })
  return NextResponse.json({
    id: user.id, name: user.name, email: user.email,
    plan: user.plan, createdAt: user.createdAt,
  })
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromCookie()
  if (!session) return NextResponse.json({ error: "Unauthenticated." }, { status: 401 })

  const user = getUserById(session.userId)
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 })

  const body = await req.json()
  const allowedKeys = ["name", "avatar"] as const

  for (const key of allowedKeys) {
    if (body[key] !== undefined) {
      (user as Record<string, unknown>)[key] = body[key]
    }
  }

  return NextResponse.json({
    ok: true,
    user: { id: user.id, name: user.name, email: user.email, plan: user.plan, avatar: user.avatar },
  })
}
