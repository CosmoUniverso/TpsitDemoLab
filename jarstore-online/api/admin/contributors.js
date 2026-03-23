// api/admin/contributors.js — lista pubblica di admin e contributori
const { getSupabase, setCors, ok, err } = require('../_utils');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const sb = getSupabase();
  const { data, error } = await sb
    .from('users')
    .select('id,github_username,avatar_url,user_status,created_at')
    .in('user_status', ['admin','superadmin'])
    .order('user_status', { ascending: false });

  if (error) return err(res, error.message, 500);
  ok(res, data || []);
};
