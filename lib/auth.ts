import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"
import { createServerClient } from "./supabase"

export interface User {
  id: string
  name: string
  email: string
  password_hash: string
  created_at: string
  plan: "community" | "pro" | "enterprise"
  avatar_url?: string
}

export interface Session {
  userId: string
  email: string
  name: string
  plan: User["plan"]
  issuedAt: number
  expiresAt: number
}

const SESSION_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "omni_dev_secret_2025_change_in_production"
)
export const COOKIE_NAME = "omni_session"
export const SESSION_TTL = 7 * 24 * 60 * 60

export async function getUserByEmail(email: string): Promise<User | null> {
  const sb = createServerClient()
  const { data } = await sb
    .from("users")
    .select("*")
    .eq("email", email.toLowerCase())
    .maybeSingle()
  return data as User | null
}

export async function getUserById(id: string): Promise<User | null> {
  const sb = createServerClient()
  const { data } = await sb
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle()
  return data as User | null
}

export async function createUser(input: {
  name: string
  email: string
  password: string
  plan?: User["plan"]
}): Promise<User> {
  const sb = createServerClient()
  const password_hash = await hashPassword(input.password)
  const { data, error } = await sb
    .from("users")
    .insert({
      name: input.name,
      email: input.email.toLowerCase(),
      password_hash,
      plan: input.plan ?? "community",
    })
    .select()
    .single()

  if (error || !data) throw new Error(error?.message ?? "Failed to create user")

  await sb.from("user_settings").insert({ user_id: data.id })

  return data as User
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12)
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

export async function createSessionToken(user: User): Promise<string> {
  const session: Session = {
    userId: user.id,
    email: user.email,
    name: user.name,
    plan: user.plan,
    issuedAt: Date.now(),
    expiresAt: Date.now() + SESSION_TTL * 1000,
  }
  return new SignJWT(session as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL}s`)
    .sign(SESSION_SECRET)
}

export async function parseSessionToken(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, SESSION_SECRET)
    return payload as unknown as Session
  } catch {
    return null
  }
}

export async function setSessionCookie(token: string) {
  const jar = await cookies()
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_TTL,
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
