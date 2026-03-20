// api/admin/queue.js — GET coda di submission in attesa
const { getSupabase, verifyToken, setCors, ok, err } = require('../_utils');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = verifyToken(req);
  if (!user?.is_admin) return err(res, 'Accesso negato', 403);

  const sb = getSupabase();
  const { data, error } = await sb
    .from('programs')
    .select('id,name,description,version,tags,status,original_name,file_size,admin_note,created_at,updated_at,uploader_id,users!uploader_id(github_username,avatar_url,github_public_repos,github_created_at,is_whitelisted)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true }); // prima i più vecchi

  if (error) return err(res, error.message, 500);

  const queue = data.map(p => ({
    ...p,
    uploader:             p.users?.github_username     || null,
    uploader_avatar:      p.users?.avatar_url          || null,
    uploader_repos:       p.users?.github_public_repos || 0,
    uploader_created:     p.users?.github_created_at   || null,
    uploader_whitelisted: p.users?.is_whitelisted      || false,
    users:                undefined,
  }));

  ok(res, queue);
};
