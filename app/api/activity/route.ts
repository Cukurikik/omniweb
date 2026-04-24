import { NextResponse } from "next/server"
import { getSessionFromCookie } from "@/lib/auth"

export async function GET() {
  const session = await getSessionFromCookie()
  const userId  = session?.userId ?? "usr_demo_0001"
  const seed    = userId.charCodeAt(4) || 5

  const activity = Array.from({ length: 30 }, (_, i) => ({
    date:     new Date(Date.now() - (29 - i) * 86400000).toISOString().slice(0, 10),
    builds:   Math.max(0, Math.round(seed * 0.4 + Math.sin(i * 0.7) * 8 + Math.random() * 6)),
    deploys:  Math.max(0, Math.round(seed * 0.12 + Math.sin(i * 0.5) * 3 + Math.random() * 2)),
    errors:   Math.max(0, Math.round(Math.random() * 2)),
    duration: Math.round(800 + Math.sin(i * 0.9) * 400 + Math.random() * 800),
  }))

  const langs = [
    { lang: "Rust",       pct: 31, color: "#ef4444" },
    { lang: "Go",         pct: 24, color: "#00d4ff" },
    { lang: "TypeScript", pct: 20, color: "#3178c6" },
    { lang: "Python",     pct: 15, color: "#f59e0b" },
    { lang: "Julia",      pct: 6,  color: "#a855f7" },
    { lang: "C++",        pct: 4,  color: "#00ff88" },
  ]

  const hourly = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    builds: Math.max(0, Math.round(Math.sin((h - 6) * Math.PI / 12) * 12 + Math.random() * 4)),
  }))

  return NextResponse.json({ activity, langs, hourly })
}
