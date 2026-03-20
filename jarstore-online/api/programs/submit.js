// api/programs/submit.js — registra la submission DOPO upload diretto su Supabase
const { getSupabase, verifyToken, setCors, ok, err } = require('../_utils');

const ACCOUNT_MIN_DAYS  = 5;
const MAX_PENDING        = 2;
const MAX_PER_24H        = 2;

async function antiSpamCheck(sb, user) {
  // 0. Whitelisted → nessun limite
  if (user.is_whitelisted) return null;

  // 1. Età account GitHub >= 5 giorni
  if (user.github_created_at) {
    const ageMs  = Date.now() - new Date(user.github_created_at).getTime();
    const minMs  = ACCOUNT_MIN_DAYS * 24 * 60 * 60 * 1000;
    if (ageMs < minMs) {
      const daysLeft = Math.ceil((minMs - ageMs) / (24 * 60 * 60 * 1000));
      return `Il tuo account GitHub deve avere almeno ${ACCOUNT_MIN_DAYS} giorni (mancano ${daysLeft} giorni).`;
    }
  }

  // 2. Almeno 1 repo pubblico
  if ((user.github_public_repos || 0) < 1) {
    return 'Il tuo account GitHub deve avere almeno 1 repository pubblico.';
  }

  // 3. Max 2 submission nelle ultime 24h (tracciato per user ID, non IP)
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: recent } = await sb
    .from('submission_log')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', since);

  if (recent >= MAX_PER_24H) {
    return `Limite raggiunto: max ${MAX_PER_24H} submission ogni 24 ore. Riprova domani.`;
  }

  // 4. Max 2 submission in pending contemporaneamente
  const { count: pending } = await sb
    .from('programs')
    .select('*', { count: 'exact', head: true })
    .eq('uploader_id', user.id)
    .eq('status', 'pending');

  if (pending >= MAX_PENDING) {
    return `Hai già ${MAX_PENDING} programmi in attesa di approvazione. Aspetta la revisione.`;
  }

  return null;
}

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return err(res, 'Method not allowed', 405);

  const user = verifyToken(req);
  if (!user) return err(res, 'Non autenticato', 401);

  const { name, description, version, tags, filePath, originalName, fileSize } = req.body || {};
  if (!name?.trim())    return err(res, 'Nome obbligatorio');
  if (!filePath)        return err(res, 'File obbligatorio');
  if (!originalName)    return err(res, 'Nome file obbligatorio');

  const sb = getSupabase();

  // Ricarica i dati aggiornati dell'utente dal DB
  const { data: dbUser } = await sb
    .from('users')
    .select('id,is_banned,is_whitelisted,is_admin,github_created_at,github_public_repos')
    .eq('id', user.id)
    .single();

  if (!dbUser)          return err(res, 'Utente non trovato', 404);
  if (dbUser.is_banned) return err(res, 'Account sospeso', 403);

  // Admin non ha limiti
  if (!user.is_admin) {
    const spamError = await antiSpamCheck(sb, dbUser);
    if (spamError) return err(res, spamError, 429);
  }

  // Crea il record in stato 'pending'
  const { data: prog, error } = await sb
    .from('programs')
    .insert({
      name:          name.trim(),
      description:   description?.trim() || '',
      version:       version?.trim()     || '1.0.0',
      tags:          tags?.trim()        || '',
      file_path:     filePath,
      original_name: originalName,
      file_size:     fileSize || 0,
      uploader_id:   user.id,
      status:        'pending',
    })
    .select()
    .single();

  if (error) return err(res, error.message, 500);

  // Registra nel log anti-spam (anche per whitelisted, ma non blocca)
  await sb.from('submission_log').insert({ user_id: user.id });

  ok(res, prog, 201);
};
