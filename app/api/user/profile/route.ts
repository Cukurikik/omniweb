import { NextRequest, NextResponse } from "next/server"
import { getSessionFromCookie, getUserById } from "@/lib/auth"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  const session = await getSessionFromCookie()
  if (!session) return NextResponse.json({ error: "Unauthenticated." }, { status: 401 })

  const user = await getUserById(session.userId)
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 })

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    plan: user.plan,
    created_at: user.created_at,
    avatar_url: user.avatar_url ?? null,
  })
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromCookie()
  if (!session) return NextResponse.json({ error: "Unauthenticated." }, { status: 401 })

  const body = await req.json()
  const allowedKeys = ["name", "avatar_url"] as const
  const updates: Record<string, unknown> = {}

  for (const key of allowedKeys) {
    if (body[key] !== undefined) updates[key] = body[key]
  }

  if (Object.keys(updates).length === 0)
    return NextResponse.json({ error: "No valid fields to update." }, { status: 400 })

  const sb = createServerClient()
  const { data, error } = await sb
    .from("users")
    .update(updates)
    .eq("id", session.userId)
    .select()
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "User not found." }, { status: 404 })

  return NextResponse.json({
    ok: true,
    user: { id: data.id, name: data.name, email: data.email, plan: data.plan, avatar_url: data.avatar_url },
  })
}
