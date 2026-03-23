const { getSupabase, getUserFromToken, setCors, ok, err, isAdmin, canViewAdmin, SUPERADMIN } = require('../_utils');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = await getUserFromToken(req);
  if (!user) return err(res, 'Non autenticato', 401);
  if (!canViewAdmin(user.user_status)) return err(res, 'Accesso negato', 403);

  const sb = getSupabase();

  if (req.method === 'GET') {
    const { data, error } = await sb
      .from('users')
      .select('id,github_username,email,avatar_url,user_status,ban_reason,github_public_repos,github_created_at,created_at,is_contributor')
      .order('created_at', { ascending: false });
    if (error) return err(res, error.message, 500);
    return ok(res, data);
  }

  // Modifiche: solo admin pieno (non teacher)
  if (req.method === 'PATCH') {
    if (!isAdmin(user.user_status)) return err(res, 'I teacher non possono modificare utenti', 403);

    const { id, action, reason } = req.body || {};
    if (!id || !action) return err(res, 'id e action obbligatori');

    const { data: target } = await sb.from('users').select('github_username,user_status').eq('id', id).single();
    if (!target) return err(res, 'Utente non trovato', 404);

    // Proteggi superadmin da tutti
    if (target.github_username === SUPERADMIN) return err(res, 'Il superadmin non può essere modificato', 403);
    if (Number(id) === Number(user.id))        return err(res, 'Non puoi modificare te stesso', 400);

    // Tutti gli admin possono gestire i ruoli (teacher non può)
    const privilegedActions = ['makeadmin','removeadmin','maketeacher','removeteacher'];
    if (privilegedActions.includes(action) && !isAdmin(user.user_status)) {
      return err(res, 'Solo admin possono gestire admin e teacher', 403);
    }

    let update = {};
    switch (action) {
      case 'approve':         update = { user_status: 'active' };        break;
      case 'ban':             update = { user_status: 'banned', ban_reason: reason||'Nessun motivo' }; break;
      case 'unban':           update = { user_status: 'active', ban_reason: null }; break;
      case 'whitelist':       update = { user_status: 'whitelisted' };   break;
      case 'unwhitelist':     update = { user_status: 'active' };        break;
      case 'makeadmin':       update = { user_status: 'admin' };         break;
      case 'removeadmin':     update = { user_status: 'active' };        break;
      case 'maketeacher':     update = { user_status: 'teacher' };       break;
      case 'removeteacher':   update = { user_status: 'active' };        break;
      case 'setcontributor':  update = { is_contributor: true };         break;
      case 'unsetcontributor':update = { is_contributor: false };        break;
      default: return err(res, 'Azione non valida');
    }

    const { error } = await sb.from('users').update(update).eq('id', id);
    if (error) return err(res, error.message, 500);
    return ok(res, { success: true });
  }

  return err(res, 'Method not allowed', 405);
};
