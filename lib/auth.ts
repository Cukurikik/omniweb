/**
 * OMNI Auth Library
 * Production implementation: bcrypt password hashing, jose JWT sessions,
 * Supabase-backed user store.
 */
import { cookies } from "next/headers"
import { compare, hash } from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"
import { createServerClient } from "@/lib/supabase"

/* ── types ──────────────────────────────────────────── */
export interface User {
  id: string
  name: string
  email: string
  password_hash: string
  plan: "community" | "pro" | "enterprise"
  avatar_url?: string
  created_at: string
}

export interface Session {
  userId: string
  email: string
  name: string
  plan: User["plan"]
  issuedAt: number
  expiresAt: number
}

/* ── Supabase user queries ──────────────────────────── */
export async function getUserByEmail(email: string): Promise<User | null> {
  const supabase = createServerClient()
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("email", email.toLowerCase())
    .maybeSingle()
  return data as User | null
}

export async function getUserById(id: string): Promise<User | null> {
  const supabase = createServerClient()
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle()
  return data as User | null
}

export async function createUser(data: {
  name: string
  email: string
  password: string
  plan?: User["plan"]
}): Promise<User> {
  const password_hash = await hashPassword(data.password)
  const supabase = createServerClient()
  const { data: user, error } = await supabase
    .from("users")
    .insert({
      name: data.name,
      email: data.email.toLowerCase(),
      password_hash,
      plan: data.plan ?? "community",
    })
    .select()
    .single()

  if (error || !user) throw new Error(error?.message ?? "Failed to create user")

  // Create default settings for the new user
  await supabase.from("user_settings").insert({ user_id: user.id })

  return user as User
}

/* ── password ────────────────────────────────────────── */
export async function hashPassword(plain: string): Promise<string> {
  return hash(plain, 12)
}

export async function verifyPassword(plain: string, hashStr: string): Promise<boolean> {
  return compare(plain, hashStr)
}

/* ── JWT session using jose ─────────────────────────── */
const SESSION_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "omni_dev_secret_2025_change_in_production"
)
export const COOKIE_NAME = "omni_session"
export const SESSION_TTL = 7 * 24 * 60 * 60 * 1000 // 7 days

export async function createSessionToken(user: User): Promise<string> {
  const session: Session = {
    userId: user.id,
    email: user.email,
    name: user.name,
    plan: user.plan,
    issuedAt: Date.now(),
    expiresAt: Date.now() + SESSION_TTL,
  }
  return new SignJWT({ session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SESSION_SECRET)
}

export async function parseSessionToken(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, SESSION_SECRET)
    return (payload as { session: Session }).session
  } catch {
    return null
  }
}

/* ── cookie helpers (server-side) ────────────────────── */
export async function setSessionCookie(token: string) {
  const jar = await cookies()
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_TTL / 1000,
    path: "/",
  })
}

export async function clearSessionCookie() {
  const jar = await cookies()
  jar.delete(COOKIE_NAME)
}

export async function getSessionFromCookie(): Promise<Session | null> {
  const jar = await cookies()
  const token = jar.get(COOKIE_NAME)?.value
  if (!token) return null
  return parseSessionToken(token)
}
