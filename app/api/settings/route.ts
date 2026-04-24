import { NextRequest, NextResponse } from "next/server"
import { getSessionFromCookie, getUserById } from "@/lib/auth"

export async function GET() {
  const session = await getSessionFromCookie()
  if (!session) return NextResponse.json({ error: "Unauthenticated." }, { status: 401 })

  const user = getUserById(session.userId)
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 })

  return NextResponse.json({
    profile: {
      id:        user.id,
      name:      user.name,
      email:     user.email,
      avatar:    user.avatar ?? null,
      plan:      user.plan,
      createdAt: user.createdAt,
    },
    preferences: {
      theme:               "dark",
      emailNotifications:  true,
      buildAlerts:         true,
      deployAlerts:        true,
      securityAlerts:      true,
      weeklyDigest:        false,
      timezone:            "UTC",
      defaultBranch:       "main",
      autoDeployOnPush:    true,
    },
    security: {
      mfaEnabled:      false,
      activeSessions:  2,
      lastPasswordChange: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    plan: {
      current:     user.plan,
      buildsUsed:  145,
      buildsLimit: user.plan === "community" ? 200 : user.plan === "pro" ? 2000 : Infinity,
      deploysUsed: 42,
      deploysLimit: user.plan === "community" ? 50 : user.plan === "pro" ? 500 : Infinity,
      renewsAt:    new Date(Date.now() + 15 * 86400000).toISOString(),
    },
  })
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromCookie()
  if (!session) return NextResponse.json({ error: "Unauthenticated." }, { status: 401 })

  const user = getUserById(session.userId)
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 })

  const body = await req.json()
  if (body.name)   user.name   = body.name.trim()
  if (body.avatar) user.avatar = body.avatar

  return NextResponse.json({
    ok: true,
    user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, plan: user.plan },
  })
}
