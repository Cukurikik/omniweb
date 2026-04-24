import { NextRequest, NextResponse } from "next/server"
import { getSessionFromCookie } from "@/lib/auth"

/* In production, replace with real DB operations */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromCookie()
  if (!session) return NextResponse.json({ error: "Unauthenticated." }, { status: 401 })
  const { id } = await params
  return NextResponse.json({ id, message: "Project details fetched." })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromCookie()
  if (!session) return NextResponse.json({ error: "Unauthenticated." }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  return NextResponse.json({ id, updated: body, message: "Project updated." })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromCookie()
  if (!session) return NextResponse.json({ error: "Unauthenticated." }, { status: 401 })
  const { id } = await params
  return NextResponse.json({ id, message: "Project deleted." })
}
