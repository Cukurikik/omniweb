import { NextRequest, NextResponse } from "next/server"
import { getSessionFromCookie } from "@/lib/auth"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  const session = await getSessionFromCookie()
  if (!session) return NextResponse.json({ error: "Unauthenticated." }, { status: 401 })

  const sb = createServerClient()
  const { data, error } = await sb
    .from("notifications")
    .select("*")
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const notifications = data ?? []
  return NextResponse.json({
    notifications,
    unread: notifications.filter((n: Record<string, unknown>) => !n.read).length,
  })
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromCookie()
  if (!session) return NextResponse.json({ error: "Unauthenticated." }, { status: 401 })

  const { id } = await req.json()
  const sb = createServerClient()

  const { error } = await sb
    .from("notifications")
    .update({ read: true })
    .eq("id", id)
    .eq("user_id", session.userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, id })
}

export async function DELETE(req: NextRequest) {
  const session = await getSessionFromCookie()
  if (!session) return NextResponse.json({ error: "Unauthenticated." }, { status: 401 })

  const { id } = await req.json()
  const sb = createServerClient()

  const { error } = await sb
    .from("notifications")
    .delete()
    .eq("id", id)
    .eq("user_id", session.userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, id })
}
