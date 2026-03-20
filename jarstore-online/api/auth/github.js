// api/auth/github.js
module.exports = (req, res) => {
  const p = new URLSearchParams({
    client_id:    process.env.GITHUB_CLIENT_ID,
    redirect_uri: `${process.env.APP_URL}/api/auth/callback`,
    scope:        'read:user user:email',
  });
  res.redirect(`https://github.com/login/oauth/authorize?${p}`);
};
