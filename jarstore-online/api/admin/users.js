// api/admin/users.js — gestione utenti: lista, ban, whitelist
const { getSupabase, verifyToken, setCors, ok, err } = require('../_utils');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = verifyToken(req);
  if (!user?.is_admin) return err(res, 'Accesso negato', 403);

  const sb = getSupabase();

  // GET — lista utenti
  if (req.method === 'GET') {
    const { data, error } = await sb
      .from('users')
      .select('id,github_username,email,avatar_url,is_admin,is_banned,ban_reason,is_whitelisted,github_public_repos,github_created_at,created_at')
      .order('created_at', { ascending: false });

    if (error) return err(res, error.message, 500);
    return ok(res, data);
  }

  // PATCH — ban/unban/whitelist
  if (req.method === 'PATCH') {
    const { id, action, reason } = req.body || {};
    if (!id || !action) return err(res, 'id e action obbligatori');

    // Non puoi modificare te stesso
    if (Number(id) === Number(user.id)) return err(res, 'Non puoi modificare te stesso', 400);

    let update = {};
    switch (action) {
      case 'ban':
        update = { is_banned: true,  ban_reason: reason || 'Nessun motivo specificato' };
        break;
      case 'unban':
        update = { is_banned: false, ban_reason: null };
        break;
      case 'whitelist':
        update = { is_whitelisted: true };
        break;
      case 'unwhitelist':
        update = { is_whitelisted: false };
        break;
      default:
        return err(res, 'Azione non valida');
    }

    const { error } = await sb.from('users').update(update).eq('id', id);
    if (error) return err(res, error.message, 500);
    return ok(res, { success: true });
  }

  return err(res, 'Method not allowed', 405);
};
