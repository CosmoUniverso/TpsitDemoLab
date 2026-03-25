const { getSupabase, setCors, err } = require('../_utils');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return err(res, 'Method not allowed', 405);

  let { q } = req.query;

  // 1. PULIZIA QUERY (Cruciale per i tag)
  // Rimuoviamo la '@' se l'utente l'ha scritta e togliamo spazi vuoti
  if (q) {
    q = q.trim().replace(/^@/, ''); 
  }

  // Se dopo la pulizia la stringa è troppo corta, non cerchiamo nulla
  if (!q || q.length < 2) {
    return res.status(200).json([]);
  }

  const sb = getSupabase();

  try {
    // 2. RICERCA SU DB
    // Usiamo ilike per ignorare maiuscole/minuscole
    const { data, error } = await sb
      .from('users')
      .select('github_username, avatar_url')
      .ilike('github_username', `%${q}%`) 
      .limit(5);

    if (error) throw error;

    // 3. FORMATTAZIONE
    const suggestions = data.map(u => ({
      username: u.github_username,
      avatar: u.avatar_url
    }));

    return res.status(200).json(suggestions);
  } catch (e) {
    console.error("Search Error:", e);
    return err(res, 'Errore durante la ricerca utenti', 500);
  }
};
