const { getSupabase, verifyToken, setCors, ok, err, canViewAdmin } = require('../_utils');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = verifyToken(req);
  const type = req.query.type || 'stats';

  // contributors è pubblico
  if (type !== 'contributors' && !canViewAdmin(user?.user_status)) {
    return err(res, 'Accesso negato', 403);
  }

  const sb = getSupabase();

  if (type === 'contributors') {
    // Admin + utenti con is_contributor = true
    const [{ data: admins }, { data: contributors }] = await Promise.all([
      sb.from('users')
        .select('id,github_username,avatar_url,user_status')
        .in('user_status', ['admin','superadmin','teacher'])
        .order('created_at', { ascending: true }),
      sb.from('users')
        .select('id,github_username,avatar_url,user_status')
        .eq('is_contributor', true)
        .not('user_status', 'in', '("admin","superadmin","teacher")')
        .order('created_at', { ascending: true }),
    ]);
    return ok(res, { admins: admins||[], contributors: contributors||[] });
  }

  if (type === 'log') {
    const { data, error } = await sb
      .from('programs')
      .select('id,name,version,status,admin_note,original_name,file_size,created_at,updated_at,uploader_id,users!uploader_id(github_username,avatar_url)')
      .in('status', ['approved','rejected'])
      .order('updated_at', { ascending: false });
    if (error) return err(res, error.message, 500);
    return ok(res, (data||[]).map(p => ({
      ...p,
      uploader: p.users?.github_username||null,
      uploader_avatar: p.users?.avatar_url||null,
      users: undefined,
    })));
  }

  // stats
  const [
    { count: totalUsers },
    { count: totalPending },
    { count: totalActive },
    { count: totalWhitelisted },
    { count: totalAdmins },
    { count: totalTeachers },
    { count: totalBanned },
    { count: totalApproved },
    { count: totalPendingPrograms },
    { data: topDownloads },
    { data: programs },
  ] = await Promise.all([
    sb.from('users').select('*',{count:'exact',head:true}),
    sb.from('users').select('*',{count:'exact',head:true}).eq('user_status','pending'),
    sb.from('users').select('*',{count:'exact',head:true}).eq('user_status','active'),
    sb.from('users').select('*',{count:'exact',head:true}).eq('user_status','whitelisted'),
    sb.from('users').select('*',{count:'exact',head:true}).in('user_status',['admin','superadmin']),
    sb.from('users').select('*',{count:'exact',head:true}).eq('user_status','teacher'),
    sb.from('users').select('*',{count:'exact',head:true}).eq('user_status','banned'),
    sb.from('programs').select('*',{count:'exact',head:true}).eq('status','approved'),
    sb.from('programs').select('*',{count:'exact',head:true}).eq('status','pending'),
    sb.from('programs').select('name,download_count').eq('status','approved').order('download_count',{ascending:false}).limit(5),
    sb.from('programs').select('file_size').eq('status','approved'),
  ]);

  const usedMB = (programs||[]).reduce((s,p)=>s+(p.file_size||0),0)/1024/1024;
  ok(res, {
    totalUsers, totalPending, totalActive, totalWhitelisted,
    totalAdmins, totalTeachers, totalBanned,
    totalApproved, totalPendingPrograms,
    totalDownloads: (topDownloads||[]).reduce((s,p)=>s+(p.download_count||0),0),
    topDownloads,
    storageUsedMB: Math.round(usedMB),
    storagePct: Math.round((usedMB/1024)*100),
  });
};
