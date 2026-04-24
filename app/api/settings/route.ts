import { NextRequest, NextResponse } from "next/server"
import { getSessionFromCookie, getUserById } from "@/lib/auth"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  const session = await getSessionFromCookie()
  if (!session) return NextResponse.json({ error: "Unauthenticated." }, { status: 401 })

  const user = await getUserById(session.userId)
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 })

  const supabase = createServerClient()

  // Get or create user settings
  let { data: settings } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", session.userId)
    .maybeSingle()

  if (!settings) {
    await supabase.from("user_settings").insert({ user_id: session.userId })
    const { data } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", session.userId)
      .maybeSingle()
    settings = data
  }

  return NextResponse.json({
    profile: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar_url: user.avatar_url ?? null,
      plan: user.plan,
      created_at: user.created_at,
    },
    preferences: settings || {},
    security: {
      mfaEnabled: false,
      activeSessions: 1,
      lastPasswordChange: null,
    },
    plan: {
      current: user.plan,
      buildsUsed: 0,
      buildsLimit: user.plan === "community" ? 200 : user.plan === "pro" ? 2000 : Infinity,
      deploysUsed: 0,
      deploysLimit: user.plan === "community" ? 50 : user.plan === "pro" ? 500 : Infinity,
      renewsAt: new Date(Date.now() + 30 * 86400000).toISOString(),
    },
  })
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromCookie()
  if (!session) return NextResponse.json({ error: "Unauthenticated." }, { status: 401 })

  const body = await req.json()
  const supabase = createServerClient()

  // Update user profile fields
  if (body.name || body.avatar_url !== undefined) {
    const profileUpdates: Record<string, unknown> = {}
    if (body.name) profileUpdates.name = body.name.trim()
    if (body.avatar_url !== undefined) profileUpdates.avatar_url = body.avatar_url

    const { error } = await supabase
      .from("users")
      .update(profileUpdates)
      .eq("id", session.userId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Update settings fields
  const settingsFields = [
    "theme", "email_notifications", "build_alerts", "deploy_alerts",
    "security_alerts", "weekly_digest", "timezone", "default_branch", "auto_deploy_on_push"
  ]
  const settingsUpdates: Record<string, unknown> = {}
  for (const key of settingsFields) {
    if (body[key] !== undefined) settingsUpdates[key] = body[key]
  }

  if (Object.keys(settingsUpdates).length > 0) {
    const { error } = await supabase
      .from("user_settings")
      .update(settingsUpdates)
      .eq("user_id", session.userId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
