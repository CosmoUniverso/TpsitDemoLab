// api/me.js
const { verifyToken, setCors, ok, err } = require('./_utils');

module.exports = (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const user = verifyToken(req);
  if (!user) return err(res, 'Non autenticato', 401);
  ok(res, user);
};
