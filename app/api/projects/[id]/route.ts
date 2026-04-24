import { NextRequest, NextResponse } from "next/server"
import { getSessionFromCookie } from "@/lib/auth"
import { createServerClient } from "@/lib/supabase"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromCookie()
  if (!session) return NextResponse.json({ error: "Unauthenticated." }, { status: 401 })

  const { id } = await params
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", session.userId)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "Project not found." }, { status: 404 })

  return NextResponse.json({ project: data })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromCookie()
  if (!session) return NextResponse.json({ error: "Unauthenticated." }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const supabase = createServerClient()

  const allowedFields = ["name", "description", "languages", "status", "visibility", "branch", "stars", "builds", "deploys", "size", "cold_start", "last_deploy"]
  const updates: Record<string, unknown> = {}
  for (const key of allowedFields) {
    if (body[key] !== undefined) updates[key] = body[key]
  }

  const { data, error } = await supabase
    .from("projects")
    .update(updates)
    .eq("id", id)
    .eq("user_id", session.userId)
    .select()
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "Project not found." }, { status: 404 })

  return NextResponse.json({ ok: true, project: data })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromCookie()
  if (!session) return NextResponse.json({ error: "Unauthenticated." }, { status: 401 })

  const { id } = await params
  const supabase = createServerClient()

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id)
    .eq("user_id", session.userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, id })
}
