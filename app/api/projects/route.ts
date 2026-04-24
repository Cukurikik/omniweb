import { NextRequest, NextResponse } from "next/server"
import { getSessionFromCookie } from "@/lib/auth"
import { createServerClient } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  const session = await getSessionFromCookie()
  if (!session) return NextResponse.json({ error: "Unauthenticated." }, { status: 401 })

  const sb = createServerClient()
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.toLowerCase() ?? ""
  const status = searchParams.get("status") ?? ""
  const sort = searchParams.get("sort") ?? "last_deploy"

  let query = sb
    .from("projects")
    .select("*")
    .eq("user_id", session.userId)

  if (status) query = query.eq("status", status)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let results = data ?? []

  if (q) {
    results = results.filter(
      (p: Record<string, unknown>) =>
        String(p.name).toLowerCase().includes(q) ||
        String(p.description).toLowerCase().includes(q)
    )
  }

  if (sort === "stars") results.sort((a: Record<string, number>, b: Record<string, number>) => b.stars - a.stars)
  if (sort === "last_deploy") results.sort((a: Record<string, string>, b: Record<string, string>) => new Date(b.last_deploy).getTime() - new Date(a.last_deploy).getTime())
  if (sort === "builds") results.sort((a: Record<string, number>, b: Record<string, number>) => b.builds - a.builds)
  if (sort === "name") results.sort((a: Record<string, string>, b: Record<string, string>) => a.name.localeCompare(b.name))

  return NextResponse.json({ projects: results, total: results.length })
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromCookie()
  if (!session) return NextResponse.json({ error: "Unauthenticated." }, { status: 401 })

  const body = await req.json()
  if (!body.name?.trim()) return NextResponse.json({ error: "Project name required." }, { status: 400 })

  const sb = createServerClient()
  const { data, error } = await sb
    .from("projects")
    .insert({
      user_id: session.userId,
      name: body.name.trim(),
      slug: body.name.trim().toLowerCase().replace(/\s+/g, "-"),
      description: body.description ?? "",
      languages: body.lang ?? ["TypeScript"],
      status: "paused",
      visibility: body.visibility ?? "private",
      stars: 0,
      branch: body.branch ?? "main",
      builds: 0,
      deploys: 0,
      size: "0 KB",
      cold_start: "--",
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, project: data }, { status: 201 })
}
