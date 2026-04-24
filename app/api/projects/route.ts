import { NextRequest, NextResponse } from "next/server"
import { getSessionFromCookie } from "@/lib/auth"
import { createServerClient } from "@/lib/supabase"

export interface Project {
  id: string
  user_id: string
  name: string
  slug: string
  description: string
  languages: string[]
  status: "live" | "building" | "failed" | "paused"
  visibility: "public" | "private"
  stars: number
  last_deploy: string | null
  branch: string
  builds: number
  deploys: number
  size: string
  cold_start: string
  created_at: string
}

export async function GET(req: NextRequest) {
  const session = await getSessionFromCookie()
  if (!session) return NextResponse.json({ error: "Unauthenticated." }, { status: 401 })

  const supabase = createServerClient()
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.toLowerCase() ?? ""
  const status = searchParams.get("status") ?? ""
  const sort = searchParams.get("sort") ?? "last_deploy"

  let query = supabase
    .from("projects")
    .select("*")
    .eq("user_id", session.userId)

  if (status) query = query.eq("status", status)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let results: Project[] = (data as Project[]) || []

  if (q) {
    results = results.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    )
  }

  if (sort === "stars") results.sort((a, b) => b.stars - a.stars)
  if (sort === "last_deploy") results.sort((a, b) =>
    new Date(b.last_deploy || 0).getTime() - new Date(a.last_deploy || 0).getTime()
  )
  if (sort === "builds") results.sort((a, b) => b.builds - a.builds)
  if (sort === "name") results.sort((a, b) => a.name.localeCompare(b.name))

  return NextResponse.json({ projects: results, total: results.length })
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromCookie()
  if (!session) return NextResponse.json({ error: "Unauthenticated." }, { status: 401 })

  const body = await req.json()
  if (!body.name?.trim()) return NextResponse.json({ error: "Project name required." }, { status: 400 })

  const supabase = createServerClient()
  const project = {
    user_id: session.userId,
    name: body.name.trim(),
    slug: body.name.trim().toLowerCase().replace(/\s+/g, "-"),
    description: body.description ?? "",
    languages: body.lang ?? ["TypeScript"],
    status: "paused" as const,
    visibility: body.visibility ?? "private",
    branch: body.branch ?? "main",
  }

  const { data, error } = await supabase
    .from("projects")
    .insert(project)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, project: data }, { status: 201 })
}
