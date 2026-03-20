// api/admin/stats.js
const { getSupabase, verifyToken, setCors, ok, err } = require('../_utils');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = verifyToken(req);
  if (!user?.is_admin) return err(res, 'Accesso negato', 403);

  const sb = getSupabase();
  const [
    { count: totalUsers },
    { count: totalApproved },
    { count: totalPending },
    { count: totalRejected },
    { data: topDownloads },
  ] = await Promise.all([
    sb.from('users').select('*',    { count: 'exact', head: true }),
    sb.from('programs').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    sb.from('programs').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    sb.from('programs').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
    sb.from('programs').select('name,download_count').eq('status','approved').order('download_count', { ascending: false }).limit(5),
  ]);

  const totalDownloads = topDownloads?.reduce((s, p) => s + (p.download_count || 0), 0) || 0;

  ok(res, { totalUsers, totalApproved, totalPending, totalRejected, totalDownloads, topDownloads });
};
