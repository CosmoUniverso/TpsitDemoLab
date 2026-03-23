const { getSupabase, verifyToken, setCors, ok, err, isAdmin, checkStorageLimit } = require('../_utils');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = verifyToken(req);
  if (!isAdmin(user?.user_status)) return err(res, 'Accesso negato', 403);

  const sb = getSupabase();
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
    sb.from('users').select('*', { count: 'exact', head: true }),
    sb.from('users').select('*', { count: 'exact', head: true }).eq('user_status','pending'),
    sb.from('users').select('*', { count: 'exact', head: true }).eq('user_status','active'),
    sb.from('users').select('*', { count: 'exact', head: true }).eq('user_status','whitelisted'),
    sb.from('users').select('*', { count: 'exact', head: true }).in('user_status',['admin','superadmin']),
    sb.from('users').select('*', { count: 'exact', head: true }).eq('user_status','banned'),
    sb.from('programs').select('*', { count: 'exact', head: true }).eq('status','approved'),
    sb.from('programs').select('*', { count: 'exact', head: true }).eq('status','pending'),
    sb.from('programs').select('name,download_count').eq('status','approved').order('download_count',{ascending:false}).limit(5),
    sb.from('programs').select('file_size').eq('status','approved'),
  ]);

  const totalDownloads = (topDownloads||[]).reduce((s,p) => s + (p.download_count||0), 0);
  const usedMB = (programs||[]).reduce((s,p) => s + (p.file_size||0), 0) / 1024 / 1024;
  const storagePct = Math.round((usedMB / 1024) * 100); // % su 1GB

  ok(res, {
    totalUsers, totalPending, totalActive, totalWhitelisted, totalAdmins, totalBanned,
    totalApproved, totalPendingPrograms, totalDownloads, topDownloads,
    storageUsedMB: Math.round(usedMB), storagePct,
  });
};
