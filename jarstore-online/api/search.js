import { createClient } from '@supabase/supabase-js';

// Inizializza Supabase usando la Service Key per bypassare RLS (o la Anon se le policy lo permettono)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  // Consentiamo solo richieste GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { q } = req.query;

  // 1. Validazione input: se manca o è minore di 2 caratteri, blocca subito
  if (!q || q.trim().length < 2) {
    return res.status(400).json({ error: 'Query di ricerca troppo corta' });
  }

  try {
    // 2. Query su Supabase
    // Cerca gli utenti che contengono la stringa digitata, ignorando il case (ilike)
    const { data, error } = await supabase
      .from('users') // Assicurati che la tabella si chiami 'users' come da tuo schema
      .select('github_username, avatar_url')
      .ilike('github_username', `%${q.trim()}%`)
      .limit(5);

    if (error) throw error;

    // 3. Mappatura Dati
    // Il frontend aspetta "username" e "avatar", quindi rinominiamo i campi del DB
    const formattedData = data.map(user => ({
      username: user.github_username,
      avatar: user.avatar_url
    }));

    // 4. Risposta al frontend
    return res.status(200).json(formattedData);

  } catch (error) {
    console.error('Errore durante la ricerca utenti:', error);
    return res.status(500).json({ error: 'Errore interno del server' });
  }
}
