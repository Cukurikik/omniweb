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

  const buildHistory = rows.map((r: Record<string, unknown>) => ({
    date: String(r.created_at).slice(0, 10),
    builds: 1,
    deploys: r.status === "success" ? 1 : 0,
    duration: Number(r.duration ?? 0),
  }))

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
  const langDist = Array.from(langMap.entries())
    .map(([lang, count]) => ({ lang, pct: Math.round((count / total) * 100), color: langColors[lang] ?? "#94a3b8" }))
    .sort((a, b) => b.pct - a.pct)

  return NextResponse.json({
    userId: session.userId,
    summary: {
      totalBuilds: rows.length,
      successRate: rows.length ? Math.round((rows.filter((r: Record<string, unknown>) => r.status === "success").length / rows.length) * 100) : 0,
      avgBuildTime: rows.length ? Math.round(rows.reduce((s: number, r: Record<string, unknown>) => s + Number(r.duration ?? 0), 0) / rows.length) : 0,
      coldStartP99: 8.6,
    },
    buildHistory,
    langDist,
  })
}
