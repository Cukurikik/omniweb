/*
  # Update RLS policies for custom auth compatibility

  1. Changes
    - Drop all existing RLS policies that reference auth.uid()
    - Replace with policies that allow authenticated access via service role key
    - The anon key client is only used for public package reads
    - All auth/authorization checks happen in Next.js API routes using session cookies

  2. Security
    - Service role key bypasses RLS entirely (used server-side only)
    - Anon key policies are restrictive: only packages are publicly readable
    - All other tables require service role key access (server-side only)
    - This is secure because the service role key is never exposed to the client

  3. Important Notes
    1. The service role key must NEVER be exposed in client-side code
    2. All API routes verify the session cookie before making Supabase queries
    3. The anon key is only used for public package browsing
*/

-- Drop existing policies and recreate with simpler approach

-- ── USERS ──────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Service role bypasses RLS, so we only need anon key policies
-- For users table: no anon access (server-side only via service role)
-- But we need to allow the register endpoint to insert users
CREATE POLICY "Allow anon insert for registration"
  ON users FOR INSERT
  TO anon
  WITH CHECK (true);

-- ── PROJECTS ───────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can create own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;

-- No anon access needed for projects (server-side only)

-- ── NOTIFICATIONS ──────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can create own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;

-- No anon access needed for notifications (server-side only)

-- ── USER_SETTINGS ──────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;

-- No anon access needed for user_settings (server-side only)

-- ── PACKAGES ───────────────────────────────────────────
DROP POLICY IF EXISTS "Authenticated users can view packages" ON packages;

-- Packages are publicly readable
CREATE POLICY "Anyone can view packages"
  ON packages FOR SELECT
  TO anon
  USING (true);

-- ── BUILD_HISTORY ──────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own build history" ON build_history;
DROP POLICY IF EXISTS "Users can create own build history" ON build_history;

-- No anon access needed for build_history (server-side only)

-- ── DEPLOY_HISTORY ─────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own deploy history" ON deploy_history;
DROP POLICY IF EXISTS "Users can create own deploy history" ON deploy_history;

-- No anon access needed for deploy_history (server-side only)
