import test from "node:test";
import assert from "node:assert";

// Mocking the required module to make the import successful
import { Module } from "module";

// @ts-ignore
const originalRequire = Module.prototype.require;

// @ts-ignore
Module.prototype.require = function (id) {
    if (id === "next/headers") {
        return {
            cookies: () => {
                return {
                    set: () => {},
                    get: () => {},
                    delete: () => {}
                };
            }
        };
    }
    // @ts-ignore
    return originalRequire.apply(this, arguments as any);
};

import { parseSessionToken } from "./auth";

test("parseSessionToken should return null for invalid JSON payload", () => {
    // 1. Arrange: Construct a token with a valid signature but invalid JSON payload.
    // The secret string must match the fallback secret inside lib/auth.ts
    const secret = process.env.SESSION_SECRET ?? "omni_dev_secret_2025_change_in_production";

    // We use a base64 encoded string that doesn't decode to valid JSON
    const invalidJsonString = "this is not valid JSON {[[[";
    const invalidJsonPayload = Buffer.from(invalidJsonString).toString("base64");

    // Replicate the signing logic from lib/auth.ts to create a valid signature for our invalid payload
    const sig = Buffer.from(`${invalidJsonPayload}:${secret}`).toString("base64").slice(0, 32);

    // Assemble the final token
    const token = `${invalidJsonPayload}.${sig}`;

    // 2. Act: Call the function we're testing
    const result = parseSessionToken(token);

    // 3. Assert: Verify the function correctly catches the JSON.parse error and returns null
    assert.strictEqual(result, null);
});
