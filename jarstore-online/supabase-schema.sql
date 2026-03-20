-- ═══════════════════════════════════════════════════════════
-- JarStore — Schema Supabase
-- Esegui nel SQL Editor di Supabase (tutto in una volta)
-- ═══════════════════════════════════════════════════════════

-- Utenti
CREATE TABLE IF NOT EXISTS users (
  id                  SERIAL PRIMARY KEY,
  github_id           TEXT        UNIQUE NOT NULL,
  github_username     TEXT        NOT NULL,
  email               TEXT,
  avatar_url          TEXT,
  is_admin            BOOLEAN     DEFAULT FALSE,
  is_banned           BOOLEAN     DEFAULT FALSE,
  ban_reason          TEXT,
  is_whitelisted      BOOLEAN     DEFAULT FALSE,  -- bypass anti-spam
  github_created_at   TIMESTAMPTZ,
  github_public_repos INT         DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Programmi
CREATE TABLE IF NOT EXISTS programs (
  id             SERIAL PRIMARY KEY,
  name           TEXT        NOT NULL,
  description    TEXT        DEFAULT '',
  version        TEXT        DEFAULT '1.0.0',
  tags           TEXT        DEFAULT '',
  status         TEXT        DEFAULT 'pending'
                 CHECK (status IN ('pending','approved','rejected')),
  file_path      TEXT,          -- path in Supabase Storage bucket "jars"
  original_name  TEXT        NOT NULL,
  file_size      BIGINT      DEFAULT 0,
  uploader_id    INT         REFERENCES users(id) ON DELETE SET NULL,
  admin_note     TEXT,          -- motivo rifiuto o nota admin
  download_count INT         DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Log submission per rate limiting (per user_id, non IP)
CREATE TABLE IF NOT EXISTS submission_log (
  id         SERIAL PRIMARY KEY,
  user_id    INT         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_programs_status   ON programs(status);
CREATE INDEX IF NOT EXISTS idx_programs_uploader ON programs(uploader_id);
CREATE INDEX IF NOT EXISTS idx_sublog_user       ON submission_log(user_id, created_at);

-- ═══════════════════════════════════════════════════════════
-- Crea il bucket Storage su Supabase:
--   Storage → New bucket → Nome: "jars" → NON spuntare Public
-- ═══════════════════════════════════════════════════════════
