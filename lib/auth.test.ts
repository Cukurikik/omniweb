import { test } from 'node:test';
import assert from 'node:assert';

// Mock 'next/headers' to allow loading auth.ts in test environment
import { createUser, getUserByEmail } from './auth.ts';

test('createUser', async (t) => {
  await t.test('should create a user and return it', () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      passwordHash: 'hashed_password',
      plan: 'pro' as const,
    };

    const user = createUser(userData);

    assert.strictEqual(user.name, userData.name);
    assert.strictEqual(user.email, userData.email);
    assert.strictEqual(user.passwordHash, userData.passwordHash);
    assert.strictEqual(user.plan, userData.plan);
    assert.ok(user.id.startsWith('usr_'));
    assert.ok(!isNaN(Date.parse(user.createdAt)));
  });

  await t.test('should store the user in the map', () => {
    const userData = {
      name: 'Storage Test',
      email: 'storage@example.com',
      passwordHash: 'hashed_password',
      plan: 'community' as const,
    };

    const user = createUser(userData);
    const retrievedUser = getUserByEmail(userData.email);

    assert.ok(retrievedUser);
    assert.strictEqual(retrievedUser?.id, user.id);
    assert.strictEqual(retrievedUser?.email, user.email);
  });

  await t.test('should handle email case-insensitivity', () => {
    const userData = {
      name: 'Case Test',
      email: 'CASE@example.com',
      passwordHash: 'hashed_password',
      plan: 'enterprise' as const,
    };

    const user = createUser(userData);
    // Should be able to retrieve with lowercase email
    const retrievedUser = getUserByEmail('case@example.com');

    assert.ok(retrievedUser);
    assert.strictEqual(retrievedUser?.id, user.id);
  });
});
