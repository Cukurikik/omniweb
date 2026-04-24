import { NextRequest, NextResponse } from "next/server"
import { getSessionFromCookie, getUserById } from "@/lib/auth"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  const session = await getSessionFromCookie()
  if (!session) return NextResponse.json({ error: "Unauthenticated." }, { status: 401 })

  const user = await getUserById(session.userId)
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 })

  return NextResponse.json({
    id: user.id, name: user.name, email: user.email,
    plan: user.plan, avatar_url: user.avatar_url ?? null, created_at: user.created_at,
  })
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromCookie()
  if (!session) return NextResponse.json({ error: "Unauthenticated." }, { status: 401 })

  const user = await getUserById(session.userId)
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 })

  const body = await req.json()
  const supabase = createServerClient()
  const updates: Record<string, unknown> = {}

  if (body.name) updates.name = body.name.trim()
  if (body.avatar_url !== undefined) updates.avatar_url = body.avatar_url

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", session.userId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    user: { id: user.id, name: body.name?.trim() ?? user.name, email: user.email, plan: user.plan, avatar_url: body.avatar_url ?? user.avatar_url },
  })
}
