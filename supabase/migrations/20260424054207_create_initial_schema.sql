/*
  # Create OMNI Build System Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `password_hash` (text)
      - `plan` (text, default 'community')
      - `avatar_url` (text, nullable)
      - `created_at` (timestamptz, default now())

    - `projects`
      - `id` (uuid, primary key)
      - `user_id` (uuid, FK to users)
      - `name` (text)
      - `slug` (text)
      - `description` (text)
      - `languages` (text array)
      - `status` (text, default 'paused')
      - `visibility` (text, default 'private')
      - `stars` (integer, default 0)
      - `last_deploy` (timestamptz, nullable)
      - `branch` (text, default 'main')
      - `builds` (integer, default 0)
      - `deploys` (integer, default 0)
      - `size` (text, default '0 KB')
      - `cold_start` (text, default '—')
      - `created_at` (timestamptz, default now())

    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, FK to users)
      - `type` (text)
      - `title` (text)
      - `message` (text)
      - `read` (boolean, default false)
      - `meta` (text, nullable)
      - `created_at` (timestamptz, default now())

    - `user_settings`
      - `user_id` (uuid, FK to users, primary key)
      - `theme` (text, default 'dark')
      - `email_notifications` (boolean, default true)
      - `build_alerts` (boolean, default true)
      - `deploy_alerts` (boolean, default true)
      - `security_alerts` (boolean, default true)
      - `weekly_digest` (boolean, default false)
      - `timezone` (text, default 'UTC')
      - `default_branch` (text, default 'main')
      - `auto_deploy_on_push` (boolean, default true)

    - `packages`
      - `id` (text, primary key)
      - `name` (text)
      - `version` (text)
      - `language` (text)
      - `description` (text)
      - `downloads` (integer, default 0)
      - `stars` (integer, default 0)
      - `license` (text)
      - `verified` (boolean, default false)
      - `author` (text)
      - `size` (text)
      - `tags` (text array)
      - `created_at` (timestamptz, default now())

    - `build_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, FK to users)
      - `project_id` (uuid, FK to projects)
      - `language` (text)
      - `status` (text)
      - `duration` (integer, nullable)
      - `branch` (text)
      - `created_at` (timestamptz, default now())

    - `deploy_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, FK to users)
      - `project_id` (uuid, FK to projects)
      - `target` (text)
      - `status` (text)
      - `size` (text, nullable)
      - `cold_start` (text, nullable)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on all tables
    - Users can only access their own data (projects, notifications, settings, builds, deploys)
    - Packages table is readable by all authenticated users
    - Only the owner can insert/update/delete their own records

  3. Important Notes
    1. All tables use uuid primary keys with gen_random_uuid() defaults
    2. Foreign key constraints ensure referential integrity
    3. Indexes added for frequently queried columns (user_id, project_id)
    4. The packages table uses text IDs to match the existing demo data format
*/

-- ── USERS TABLE ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  email         text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  plan          text NOT NULL DEFAULT 'community' CHECK (plan IN ('community', 'pro', 'enterprise')),
  avatar_url    text,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ── PROJECTS TABLE ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  slug        text NOT NULL,
  description text NOT NULL DEFAULT '',
  languages   text[] NOT NULL DEFAULT '{}',
  status      text NOT NULL DEFAULT 'paused' CHECK (status IN ('live', 'building', 'failed', 'paused')),
  visibility  text NOT NULL DEFAULT 'private' CHECK (visibility IN ('public', 'private')),
  stars       integer NOT NULL DEFAULT 0,
  last_deploy timestamptz,
  branch      text NOT NULL DEFAULT 'main',
  builds      integer NOT NULL DEFAULT 0,
  deploys     integer NOT NULL DEFAULT 0,
  size        text NOT NULL DEFAULT '0 KB',
  cold_start  text NOT NULL DEFAULT '—',
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);

-- ── NOTIFICATIONS TABLE ─────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       text NOT NULL CHECK (type IN ('success', 'warning', 'error', 'info', 'deploy')),
  title      text NOT NULL,
  message    text NOT NULL,
  read       boolean NOT NULL DEFAULT false,
  meta       text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- ── USER_SETTINGS TABLE ─────────────────────────────────
CREATE TABLE IF NOT EXISTS user_settings (
  user_id             uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  theme               text NOT NULL DEFAULT 'dark',
  email_notifications boolean NOT NULL DEFAULT true,
  build_alerts        boolean NOT NULL DEFAULT true,
  deploy_alerts       boolean NOT NULL DEFAULT true,
  security_alerts     boolean NOT NULL DEFAULT true,
  weekly_digest       boolean NOT NULL DEFAULT false,
  timezone            text NOT NULL DEFAULT 'UTC',
  default_branch      text NOT NULL DEFAULT 'main',
  auto_deploy_on_push boolean NOT NULL DEFAULT true
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ── PACKAGES TABLE ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS packages (
  id          text PRIMARY KEY,
  name        text NOT NULL,
  version     text NOT NULL,
  language    text NOT NULL,
  description text NOT NULL,
  downloads   integer NOT NULL DEFAULT 0,
  stars       integer NOT NULL DEFAULT 0,
  license     text NOT NULL,
  verified    boolean NOT NULL DEFAULT false,
  author      text NOT NULL,
  size        text NOT NULL,
  tags        text[] NOT NULL DEFAULT '{}',
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view packages"
  ON packages FOR SELECT
  TO authenticated
  USING (true);

-- ── BUILD_HISTORY TABLE ─────────────────────────────────
CREATE TABLE IF NOT EXISTS build_history (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  language    text NOT NULL,
  status     text NOT NULL CHECK (status IN ('success', 'failed', 'running')),
  duration   integer,
  branch     text NOT NULL DEFAULT 'main',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE build_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own build history"
  ON build_history FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own build history"
  ON build_history FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_build_history_user_id ON build_history(user_id);
CREATE INDEX IF NOT EXISTS idx_build_history_project_id ON build_history(project_id);

-- ── DEPLOY_HISTORY TABLE ────────────────────────────────
CREATE TABLE IF NOT EXISTS deploy_history (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  target     text NOT NULL,
  status     text NOT NULL CHECK (status IN ('live', 'stopped', 'building', 'failed')),
  size       text,
  cold_start text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE deploy_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own deploy history"
  ON deploy_history FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own deploy history"
  ON deploy_history FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_deploy_history_user_id ON deploy_history(user_id);
CREATE INDEX IF NOT EXISTS idx_deploy_history_project_id ON deploy_history(project_id);
