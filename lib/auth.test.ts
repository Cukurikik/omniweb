import { describe, test } from "node:test";
import * as assert from "node:assert/strict";
import { getUserByEmail, createUser } from "./auth.ts";

describe("getUserByEmail", () => {
  test("should retrieve an existing user by email (demo user)", () => {
    const user = getUserByEmail("demo@omni.dev");
    assert.ok(user, "User should exist");
    assert.equal(user.email, "demo@omni.dev");
    assert.equal(user.name, "Demo Developer");
  });

  test("should handle case sensitivity correctly", () => {
    const user = getUserByEmail("DeMo@OmNi.DeV");
    assert.ok(user, "User should exist even with different casing");
    assert.equal(user.email, "demo@omni.dev");
  });

  test("should return undefined for a non-existent user", () => {
    const user = getUserByEmail("nonexistent@example.com");
    assert.equal(user, undefined);
  });

  test("should retrieve a newly created user", () => {
    const newUser = createUser({
      name: "Test User",
      email: "test@omni.dev",
      passwordHash: "testhash",
      plan: "community",
    });

    const retrievedUser = getUserByEmail("test@omni.dev");
    assert.ok(retrievedUser, "Newly created user should be retrievable");
    assert.equal(retrievedUser.id, newUser.id);
    assert.equal(retrievedUser.email, "test@omni.dev");
  });
});
