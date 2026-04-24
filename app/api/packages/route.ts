import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  const supabase = createServerClient()
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.toLowerCase() ?? ""
  const lang = searchParams.get("lang") ?? ""
  const sort = searchParams.get("sort") ?? "downloads"
  const page = parseInt(searchParams.get("page") ?? "1", 10)
  const per = parseInt(searchParams.get("per") ?? "12", 10)

  let query = supabase.from("packages").select("*")

  if (lang) query = query.eq("language", lang)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let results: Record<string, unknown>[] = (data as Record<string, unknown>[]) || []

  if (q) {
    results = results.filter(p => {
      const name = (p.name as string).toLowerCase()
      const desc = (p.description as string).toLowerCase()
      const tags = (p.tags as string[]) || []
      return name.includes(q) || desc.includes(q) || tags.some(t => t.includes(q))
    })
  }

  if (sort === "stars") results.sort((a, b) => (b.stars as number) - (a.stars as number))
  if (sort === "downloads") results.sort((a, b) => (b.downloads as number) - (a.downloads as number))
  if (sort === "name") results.sort((a, b) => (a.name as string).localeCompare(b.name as string))

  const total = results.length
  const sliced = results.slice((page - 1) * per, page * per)

  return NextResponse.json({
    packages: sliced,
    total,
    page,
    per,
    pages: Math.ceil(total / per),
  })
}
