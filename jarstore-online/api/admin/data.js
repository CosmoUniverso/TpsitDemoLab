// api/admin/data.js — stats + log + contributors (unificati per limite Vercel Hobby)
// Usa ?type=stats | log | contributors
const { getSupabase, verifyToken, setCors, ok, err, isAdmin } = require('../_utils');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = verifyToken(req);
  const type = req.query.type || 'stats';

  // contributors è pubblico, il resto solo admin
  if (type !== 'contributors' && !isAdmin(user?.user_status)) {
    return err(res, 'Accesso negato', 403);
  }

  const sb = getSupabase();

  // ── contributors (pubblico) ───────────────────────────────────────────────
  if (type === 'contributors') {
    const { data, error } = await sb
      .from('users')
      .select('id,github_username,avatar_url,user_status,created_at')
      .in('user_status', ['admin','superadmin'])
      .order('user_status', { ascending: false });
    if (error) return err(res, error.message, 500);
    return ok(res, data || []);
  }

  // ── log (solo admin) ──────────────────────────────────────────────────────
  if (type === 'log') {
    const { data, error } = await sb
      .from('programs')
      .select('id,name,version,status,admin_note,original_name,file_size,created_at,updated_at,uploader_id,users!uploader_id(github_username,avatar_url)')
      .in('status', ['approved','rejected'])
      .order('updated_at', { ascending: false });
    if (error) return err(res, error.message, 500);
    const log = (data || []).map(p => ({
      ...p,
      uploader:        p.users?.github_username || null,
      uploader_avatar: p.users?.avatar_url      || null,
      users:           undefined,
    }));
    return ok(res, log);
  }

  // ── stats (solo admin) ────────────────────────────────────────────────────
  const [
    { count: totalUsers },
    { count: totalPending },
    { count: totalActive },
    { count: totalWhitelisted },
    { count: totalAdmins },
    { count: totalBanned },
    { count: totalApproved },
    { count: totalPendingPrograms },
    { data: topDownloads },
    { data: programs },
  ] = await Promise.all([
    sb.from('users').select('*', { count:'exact', head:true }),
    sb.from('users').select('*', { count:'exact', head:true }).eq('user_status','pending'),
    sb.from('users').select('*', { count:'exact', head:true }).eq('user_status','active'),
    sb.from('users').select('*', { count:'exact', head:true }).eq('user_status','whitelisted'),
    sb.from('users').select('*', { count:'exact', head:true }).in('user_status',['admin','superadmin']),
    sb.from('users').select('*', { count:'exact', head:true }).eq('user_status','banned'),
    sb.from('programs').select('*', { count:'exact', head:true }).eq('status','approved'),
    sb.from('programs').select('*', { count:'exact', head:true }).eq('status','pending'),
    sb.from('programs').select('name,download_count').eq('status','approved').order('download_count',{ascending:false}).limit(5),
    sb.from('programs').select('file_size').eq('status','approved'),
  ]);

  const usedMB = (programs||[]).reduce((s,p)=>s+(p.file_size||0),0)/1024/1024;
  const storagePct = Math.round((usedMB/1024)*100);

  ok(res, {
    totalUsers, totalPending, totalActive, totalWhitelisted, totalAdmins, totalBanned,
    totalApproved, totalPendingPrograms,
    totalDownloads: (topDownloads||[]).reduce((s,p)=>s+(p.download_count||0),0),
    topDownloads,
    storageUsedMB: Math.round(usedMB), storagePct,
  });
};
