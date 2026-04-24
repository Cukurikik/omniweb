import { NextResponse } from "next/server"
import { getSessionFromCookie } from "@/lib/auth"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  const session = await getSessionFromCookie()
  if (!session) return NextResponse.json({ error: "Unauthenticated." }, { status: 401 })

  const sb = createServerClient()
  const since = new Date(Date.now() - 30 * 86400000).toISOString()

  const { data, error } = await sb
    .from("build_history")
    .select("created_at, status, duration, language")
    .eq("user_id", session.userId)
    .gte("created_at", since)
    .order("created_at", { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows = data ?? []

  const byDay = new Map<string, { builds: number; deploys: number; errors: number; duration: number }>()
  for (const r of rows) {
    const day = String(r.created_at).slice(0, 10)
    const entry = byDay.get(day) ?? { builds: 0, deploys: 0, errors: 0, duration: 0 }
    entry.builds++
    if (r.status === "success") entry.deploys++
    if (r.status === "failed") entry.errors++
    entry.duration += Number(r.duration ?? 0)
    byDay.set(day, entry)
  }

  const activity = Array.from(byDay.entries()).map(([date, e]) => ({ date, ...e }))

  const langMap = new Map<string, number>()
  for (const r of rows) {
    const l = String(r.language ?? "Unknown").split("+")[0].trim()
    langMap.set(l, (langMap.get(l) ?? 0) + 1)
  }
  const total = rows.length || 1
  const langColors: Record<string, string> = {
    Rust: "#ef4444", Go: "#00d4ff", Python: "#f59e0b",
    TypeScript: "#3178c6", Julia: "#a855f7", "C++": "#00ff88",
  }
  const langs = Array.from(langMap.entries())
    .map(([lang, count]) => ({ lang, pct: Math.round((count / total) * 100), color: langColors[lang] ?? "#94a3b8" }))
    .sort((a, b) => b.pct - a.pct)

  return NextResponse.json({ activity, langs })
}
