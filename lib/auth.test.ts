import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getUserByEmail,
  createUser,
  getUserById,
  hashPassword,
  verifyPassword,
  createSessionToken,
  parseSessionToken,
  setSessionCookie,
  clearSessionCookie,
  getSessionFromCookie,
  SESSION_TTL,
  COOKIE_NAME,
} from './auth';
import type { User } from './auth';

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

import { cookies } from 'next/headers';

describe('auth.ts', () => {
  describe('User Store', () => {
    it('should find the demo user by email', () => {
      const user = getUserByEmail('demo@omni.dev');
      expect(user).toBeDefined();
      expect(user?.email).toBe('demo@omni.dev');
      expect(user?.id).toBe('usr_demo_0001');
    });

    it('should be case-insensitive for email lookup', () => {
      const user = getUserByEmail('DEMO@OMNI.DEV');
      expect(user).toBeDefined();
      expect(user?.email).toBe('demo@omni.dev');
    });

    it('should return undefined for non-existent user by email', () => {
      expect(getUserByEmail('nonexistent@example.com')).toBeUndefined();
    });

    it('should find user by id', () => {
      const user = getUserById('usr_demo_0001');
      expect(user).toBeDefined();
      expect(user?.id).toBe('usr_demo_0001');
    });

    it('should return undefined for non-existent user by id', () => {
      expect(getUserById('nonexistent_id')).toBeUndefined();
    });

    it('should create a new user', () => {
      const newUser = createUser({
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'hashed_pw',
        plan: 'community',
      });

      expect(newUser.id).toMatch(/^usr_\d+_[a-z0-9]+$/);
      expect(newUser.name).toBe('Test User');
      expect(newUser.email).toBe('test@example.com');
      expect(newUser.createdAt).toBeDefined();

      const fetchedUser = getUserByEmail('test@example.com');
      expect(fetchedUser).toBeDefined();
      expect(fetchedUser?.id).toBe(newUser.id);

      const fetchedById = getUserById(newUser.id);
      expect(fetchedById).toBeDefined();
    });
  });

  describe('Password Utils', () => {
    it('should verify correct password', async () => {
      // Demo shortcut password
      expect(await verifyPassword('omni2025', 'omni2025_hashed')).toBe(true);

      // Hashed simulation password
      const hash = await hashPassword('mypassword');
      expect(await verifyPassword('mypassword', hash)).toBe(true);
    });

    it('should reject incorrect password', async () => {
      expect(await verifyPassword('wrongpassword', 'omni2025_hashed')).toBe(false);

      const hash = await hashPassword('mypassword');
      expect(await verifyPassword('wrongpassword', hash)).toBe(false);
    });
  });

  describe('Session Token', () => {
    let mockUser: User;

    beforeEach(() => {
      mockUser = {
        id: 'user_123',
        email: 'testsession@example.com',
        name: 'Session Tester',
        passwordHash: 'hash',
        createdAt: new Date().toISOString(),
        plan: 'pro',
      };
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should create a valid session token', () => {
      const token = createSessionToken(mockUser);
      expect(token).toBeTypeOf('string');
      expect(token.includes('.')).toBe(true);
    });

    it('should parse a valid session token correctly', () => {
      const token = createSessionToken(mockUser);
      const session = parseSessionToken(token);

      expect(session).toBeDefined();
      expect(session?.userId).toBe(mockUser.id);
      expect(session?.email).toBe(mockUser.email);
      expect(session?.name).toBe(mockUser.name);
      expect(session?.plan).toBe(mockUser.plan);
    });

    it('should return null for malformed token (no dot)', () => {
      expect(parseSessionToken('invalidtoken')).toBeNull();
    });

    it('should return null for invalid signature', () => {
      const token = createSessionToken(mockUser);
      const [payload, sig] = token.split('.');
      const tamperedToken = `${payload}.invalid${sig}`;
      expect(parseSessionToken(tamperedToken)).toBeNull();
    });

    it('should return null for tampered payload', () => {
      const token = createSessionToken(mockUser);
      const [payload, sig] = token.split('.');
      // Tamper payload (change base64 content slightly)
      const tamperedToken = `a${payload}.${sig}`;
      expect(parseSessionToken(tamperedToken)).toBeNull();
    });

    it('should return null if token payload is invalid JSON', () => {
       const invalidJsonBase64 = Buffer.from("invalid json").toString("base64");
       const secret = process.env.SESSION_SECRET ?? "omni_dev_secret_2025_change_in_production";
       const sig = Buffer.from(`${invalidJsonBase64}:${secret}`).toString("base64").slice(0, 32);
       const invalidToken = `${invalidJsonBase64}.${sig}`;

       expect(parseSessionToken(invalidToken)).toBeNull();
    });

    it('should return null for expired token', () => {
      const token = createSessionToken(mockUser);

      // Advance time past the session TTL
      vi.advanceTimersByTime(SESSION_TTL + 1000);

      const session = parseSessionToken(token);
      expect(session).toBeNull();
    });
  });

  describe('Cookie Helpers', () => {
    let mockCookieJar: any;

    beforeEach(() => {
      mockCookieJar = {
        set: vi.fn(),
        delete: vi.fn(),
        get: vi.fn(),
      };
      // @ts-ignore
      cookies.mockResolvedValue(mockCookieJar);
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('should set session cookie', async () => {
      await setSessionCookie('test-token');
      expect(mockCookieJar.set).toHaveBeenCalledWith(
        COOKIE_NAME,
        'test-token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
        })
      );
    });

    it('should clear session cookie', async () => {
      await clearSessionCookie();
      expect(mockCookieJar.delete).toHaveBeenCalledWith(COOKIE_NAME);
    });

    it('should get session from valid cookie', async () => {
      const mockUser = {
        id: 'cookie_user',
        email: 'cookie@example.com',
        name: 'Cookie User',
        passwordHash: 'hash',
        createdAt: new Date().toISOString(),
        plan: 'community' as const,
      };
      const token = createSessionToken(mockUser);
      mockCookieJar.get.mockReturnValue({ value: token });

      const session = await getSessionFromCookie();
      expect(session).toBeDefined();
      expect(session?.userId).toBe('cookie_user');
    });

    it('should return null if no cookie present', async () => {
      mockCookieJar.get.mockReturnValue(undefined);
      const session = await getSessionFromCookie();
      expect(session).toBeNull();
    });
  });
});
