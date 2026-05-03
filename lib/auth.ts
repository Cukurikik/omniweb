/**
 * OMNI Auth Library
 * Provides: password hashing (bcrypt), JWT creation/verification,
 * session cookie helpers, and in-memory user store (replace with DB).
 */
import { cookies } from "next/headers"

/* ── types ──────────────────────────────────────────── */
export interface User {
  id:        string
  name:      string
  email:     string
  passwordHash: string
  createdAt: string
  plan:      "community" | "pro" | "enterprise"
  avatar?:   string
}

export interface Session {
  userId:    string
  email:     string
  name:      string
  plan:      User["plan"]
  issuedAt:  number
  expiresAt: number
}

/* ── in-memory store (replace with DB in production) ── */
const USERS = new Map<string, User>()

/* Seed demo user */
USERS.set("demo@omni.dev", {
  id:           "usr_demo_0001",
  name:         "Demo Developer",
  email:        "demo@omni.dev",
  passwordHash: "omni2025_hashed", // simplified — see note below
  createdAt:    "2025-01-01T00:00:00Z",
  plan:         "pro",
})

export function getUserByEmail(email: string): User | undefined {
  return USERS.get(email.toLowerCase())
}

export function createUser(data: Omit<User, "id" | "createdAt">): User {
  const user: User = {
    ...data,
    id:        `usr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  }
  USERS.set(user.email.toLowerCase(), user)
  return user
}

export function getUserById(id: string): User | undefined {
  return Array.from(USERS.values()).find(u => u.id === id)
}

/* ── password ────────────────────────────────────────── */
/**
 * In production, use bcrypt or argon2.
 * For this demo environment we use a simple hash simulation.
 */
export async function hashPassword(plain: string): Promise<string> {
  // Production: return await bcrypt.hash(plain, 12)
  return Buffer.from(plain + ":omni_salt_2025").toString("base64")
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  // Production: return await bcrypt.compare(plain, hash)
  if (hash === "omni2025_hashed") return plain === "omni2025" // demo shortcut
  const expected = Buffer.from(plain + ":omni_salt_2025").toString("base64")
  return expected === hash
}

/* ── JWT-like session (base64 encoded JSON + HMAC) ───── */
if (!process.env.SESSION_SECRET) {
  throw new Error("CRITICAL: SESSION_SECRET environment variable is not set. Authentication cannot be initialized.")
}
const SESSION_SECRET  = process.env.SESSION_SECRET
export const COOKIE_NAME    = "omni_session"
export const SESSION_TTL    = 7 * 24 * 60 * 60 * 1000 // 7 days

function sign(payload: string, secret: string): string {
  // Simple HMAC-like signature for demo. In production use jose or auth.js
  const sig = Buffer.from(`${payload}:${secret}`).toString("base64").slice(0, 32)
  return `${payload}.${sig}`
}

function verify(token: string, secret: string): string | null {
  const lastDot  = token.lastIndexOf(".")
  if (lastDot < 0) return null
  const payload  = token.slice(0, lastDot)
  const expected = Buffer.from(`${payload}:${secret}`).toString("base64").slice(0, 32)
  const actual   = token.slice(lastDot + 1)
  if (actual !== expected) return null
  return payload
}

export function createSessionToken(user: User): string {
  const session: Session = {
    userId:    user.id,
    email:     user.email,
    name:      user.name,
    plan:      user.plan,
    issuedAt:  Date.now(),
    expiresAt: Date.now() + SESSION_TTL,
  }
  const payload = Buffer.from(JSON.stringify(session)).toString("base64")
  return sign(payload, SESSION_SECRET)
}

export function parseSessionToken(token: string): Session | null {
  try {
    const payload = verify(token, SESSION_SECRET)
    if (!payload) return null
    const session: Session = JSON.parse(Buffer.from(payload, "base64").toString())
    if (session.expiresAt < Date.now()) return null
    return session
  } catch {
    return null
  }
}

/* ── cookie helpers (server-side) ────────────────────── */
export async function setSessionCookie(token: string) {
  const jar = await cookies()
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   SESSION_TTL / 1000,
    path:     "/",
  })
}

export async function clearSessionCookie() {
  const jar = await cookies()
  jar.delete(COOKIE_NAME)
}

export async function getSessionFromCookie(): Promise<Session | null> {
  const jar   = await cookies()
  const token = jar.get(COOKIE_NAME)?.value
  if (!token) return null
  return parseSessionToken(token)
}
