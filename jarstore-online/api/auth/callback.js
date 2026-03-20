// api/auth/callback.js
const { getSupabase, signToken, ADMIN_GITHUB_USERNAME } = require('../_utils');

async function ghGet(url, token) {
  const r = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'JarStore' },
  });
  return r.json();
}

module.exports = async (req, res) => {
  const APP = process.env.APP_URL;
  const { code } = req.query;
  if (!code) return res.redirect(`${APP}/login?error=no_code`);

  try {
    // 1. Scambia code → access token
    const tkRes = await fetch('https://github.com/login/oauth/access_token', {
      method:  'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        client_id:     process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri:  `${APP}/api/auth/callback`,
      }),
    });
    const { access_token: at } = await tkRes.json();
    if (!at) throw new Error('no access_token');

    // 2. Dati utente GitHub
    const [gu, emails] = await Promise.all([
      ghGet('https://api.github.com/user', at),
      ghGet('https://api.github.com/user/emails', at).catch(() => []),
    ]);
    const email = (Array.isArray(emails) ? emails.find(e => e.primary)?.email : null) || gu.email || null;

    // 3. Upsert su Supabase
    const sb = getSupabase();
    const { data: user, error } = await sb
      .from('users')
      .upsert({
        github_id:           String(gu.id),
        github_username:     gu.login,
        email,
        avatar_url:          gu.avatar_url,
        is_admin:            gu.login === ADMIN_GITHUB_USERNAME,
        github_created_at:   gu.created_at,
        github_public_repos: gu.public_repos || 0,
      }, { onConflict: 'github_id' })
      .select()
      .single();

    if (error) throw error;
    if (user.is_banned) return res.redirect(`${APP}/login?error=banned`);

    // 4. Genera JWT
    const token = signToken({
      id:              user.id,
      github_username: user.github_username,
      email:           user.email,
      avatar_url:      user.avatar_url,
      is_admin:        user.is_admin,
      is_whitelisted:  user.is_whitelisted,
    });

    res.redirect(`${APP}/auth/callback?token=${token}`);
  } catch (e) {
    console.error('[auth/callback]', e.message);
    res.redirect(`${process.env.APP_URL}/login?error=auth_failed`);
  }
};
