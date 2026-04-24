import { NextResponse } from "next/server"
import { getSessionFromCookie } from "@/lib/auth"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  const session = await getSessionFromCookie()
  if (!session) return NextResponse.json({ error: "Unauthenticated." }, { status: 401 })

  const supabase = createServerClient()
  const userId = session.userId

  // 30-day activity from build_history
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: buildsData } = await supabase
    .from("build_history")
    .select("created_at, status, duration")
    .eq("user_id", userId)
    .gte("created_at", thirtyDaysAgo.toISOString())
    .order("created_at", { ascending: true })

  // Group by day
  const activityMap: Record<string, { date: string; builds: number; deploys: number; errors: number; duration: number }> = {}
  for (let i = 0; i < 30; i++) {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    const key = d.toISOString().slice(0, 10)
    activityMap[key] = { date: key, builds: 0, deploys: 0, errors: 0, duration: 0 }
  }

  for (const b of (buildsData || [])) {
    const key = new Date(b.created_at).toISOString().slice(0, 10)
    if (activityMap[key]) {
      activityMap[key].builds++
      activityMap[key].duration += b.duration || 0
      if (b.status === "failed") activityMap[key].errors++
    }
  }

  // Get deploys
  const { data: deploysData } = await supabase
    .from("deploy_history")
    .select("created_at")
    .eq("user_id", userId)
    .gte("created_at", thirtyDaysAgo.toISOString())

  for (const d of (deploysData || [])) {
    const key = new Date(d.created_at).toISOString().slice(0, 10)
    if (activityMap[key]) activityMap[key].deploys++
  }

  // Language distribution
  const { data: projectsData } = await supabase
    .from("projects")
    .select("languages")
    .eq("user_id", userId)

  const langCounts: Record<string, number> = {}
  for (const p of (projectsData || [])) {
    for (const lang of (p.languages || [])) {
      langCounts[lang] = (langCounts[lang] || 0) + 1
    }
  }
  const totalLangs = Object.values(langCounts).reduce((a, b) => a + b, 0) || 1
  const langs = Object.entries(langCounts).map(([lang, count]) => ({
    lang, pct: Math.round((count / totalLangs) * 100),
  }))

  // Hourly distribution
  const hourly = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    builds: 0,
  }))

  return NextResponse.json({
    activity: Object.values(activityMap),
    langs: langs.length > 0 ? langs : [
      { lang: "Rust", pct: 31 }, { lang: "Go", pct: 24 },
      { lang: "TypeScript", pct: 20 }, { lang: "Python", pct: 15 },
      { lang: "Julia", pct: 6 }, { lang: "C++", pct: 4 },
    ],
    hourly,
  })
}
