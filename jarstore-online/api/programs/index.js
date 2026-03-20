// api/programs/index.js — GET programmi approvati
const { getSupabase, verifyToken, setCors, ok, err } = require('../_utils');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return err(res, 'Method not allowed', 405);

  const sb   = getSupabase();
  const user = verifyToken(req);

  const { data, error } = await sb
    .from('programs')
    .select('id,name,description,version,tags,file_path,original_name,file_size,download_count,created_at,uploader_id,users!uploader_id(github_username,avatar_url)')
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) return err(res, error.message, 500);

  const programs = data.map(p => ({
    ...p,
    uploader:        p.users?.github_username || null,
    uploader_avatar: p.users?.avatar_url      || null,
    users:           undefined,
  }));

  ok(res, programs);
};
