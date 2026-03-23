-- ═══════════════════════════════════════════════════════════
-- JarStore — Migration v2
-- Esegui nel SQL Editor di Supabase
-- ═══════════════════════════════════════════════════════════

-- Aggiungi ruolo teacher e campo is_contributor
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_contributor BOOLEAN DEFAULT FALSE;

-- Aggiorna il CHECK constraint per includere teacher
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_user_status_check;
ALTER TABLE users ADD CONSTRAINT users_user_status_check
  CHECK (user_status IN ('pending','active','whitelisted','admin','superadmin','banned','teacher'));

-- Aggiorna la funzione increment_downloads se non esiste
CREATE OR REPLACE FUNCTION increment_downloads(program_id INT)
RETURNS void AS $$
  UPDATE programs SET download_count = download_count + 1 WHERE id = program_id;
$$ LANGUAGE sql;
