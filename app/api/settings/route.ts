import { NextRequest, NextResponse } from "next/server"
import { getSessionFromCookie } from "@/lib/auth"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  const session = await getSessionFromCookie()
  if (!session) return NextResponse.json({ error: "Unauthenticated." }, { status: 401 })

  const sb = createServerClient()
  const { data, error } = await sb
    .from("user_settings")
    .select("*")
    .eq("user_id", session.userId)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (!data) {
    const { data: created, error: createErr } = await sb
      .from("user_settings")
      .insert({ user_id: session.userId })
      .select()
      .single()

    if (createErr) return NextResponse.json({ error: createErr.message }, { status: 500 })
    return NextResponse.json({ settings: created })
  }

  return NextResponse.json({ settings: data })
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromCookie()
  if (!session) return NextResponse.json({ error: "Unauthenticated." }, { status: 401 })

  const body = await req.json()
  const sb = createServerClient()

  const { data, error } = await sb
    .from("user_settings")
    .update(body)
    .eq("user_id", session.userId)
    .select()
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (!data) {
    const { data: created, error: createErr } = await sb
      .from("user_settings")
      .insert({ user_id: session.userId, ...body })
      .select()
      .single()

    if (createErr) return NextResponse.json({ error: createErr.message }, { status: 500 })
    return NextResponse.json({ ok: true, settings: created })
  }

  return NextResponse.json({ ok: true, settings: data })
}
