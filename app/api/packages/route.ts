import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  const sb = createServerClient()
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.toLowerCase() ?? ""
  const lang = searchParams.get("lang") ?? ""
  const sort = searchParams.get("sort") ?? "downloads"
  const page = parseInt(searchParams.get("page") ?? "1", 10)
  const per = parseInt(searchParams.get("per") ?? "12", 10)

  let query = sb.from("packages").select("*")

  if (lang) query = query.eq("language", lang)

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
  if (sort === "downloads") results.sort((a: Record<string, number>, b: Record<string, number>) => b.downloads - a.downloads)
  if (sort === "name") results.sort((a: Record<string, string>, b: Record<string, string>) => a.name.localeCompare(b.name))

  const total = results.length
  const sliced = results.slice((page - 1) * per, page * per)

  return NextResponse.json({ packages: sliced, total, page, per, pages: Math.ceil(total / per) })
}
