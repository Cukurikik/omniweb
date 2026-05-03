import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'
import * as authLib from '@/lib/auth'

// We need to mock next/headers cookies to prevent error from next.js internals
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockReturnValue({
    set: vi.fn(),
    delete: vi.fn(),
    get: vi.fn()
  })
}))

describe('POST /api/auth/register', () => {
  const createRequest = (body: any) => {
    return new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body)
    })
  }

  it('should return 400 if name is missing', async () => {
    const req = createRequest({ email: 'test@example.com', password: 'password123' })
    const res = await POST(req)

    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Name is required.')
  })

  it('should return 400 if email is invalid', async () => {
    const req = createRequest({ name: 'Test User', email: 'invalid-email', password: 'password123' })
    const res = await POST(req)

    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Invalid email address.')
  })

  it('should return 400 if password is too short', async () => {
    const req = createRequest({ name: 'Test User', email: 'test@example.com', password: 'short' })
    const res = await POST(req)

    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Password must be at least 8 characters.')
  })

  it('should return 409 if email already exists', async () => {
    // The demo user 'demo@omni.dev' exists by default in lib/auth.ts
    const req = createRequest({ name: 'Another Demo', email: 'demo@omni.dev', password: 'password123' })
    const res = await POST(req)

    expect(res.status).toBe(409)
    const data = await res.json()
    expect(data.error).toBe('An account with that email already exists.')
  })

  it('should create user and return 201 with session cookie on successful registration', async () => {
    const uniqueEmail = `test-${Date.now()}@example.com`
    const req = createRequest({ name: 'Test User', email: uniqueEmail, password: 'password123' })

    const res = await POST(req)

    expect(res.status).toBe(201)

    const data = await res.json()
    expect(data.ok).toBe(true)
    expect(data.user).toMatchObject({
      name: 'Test User',
      email: uniqueEmail,
      plan: 'community'
    })
    expect(data.user.id).toBeDefined()
    expect(data.user.createdAt).toBeDefined()

    // Assert that the response has a Set-Cookie header for the session
    const cookies = res.cookies.getAll()
    const sessionCookie = cookies.find(c => c.name === authLib.COOKIE_NAME)
    expect(sessionCookie).toBeDefined()
    expect(sessionCookie?.value).toBeTruthy()
    expect(sessionCookie?.path).toBe('/')
    expect(sessionCookie?.sameSite).toBe('lax')
    expect(sessionCookie?.httpOnly).toBe(false)
  })
})
