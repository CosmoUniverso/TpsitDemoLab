// api/_utils.js
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

const ADMIN_GITHUB_USERNAME = 'CosmoUniverso';
const BUCKET = 'jars';

function getSupabase() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  });
}

function verifyToken(req) {
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;
  try { return jwt.verify(token, process.env.JWT_SECRET); }
  catch { return null; }
}

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

const ok  = (res, data, status = 200) => res.status(status).json(data);
const err = (res, msg,  status = 400) => res.status(status).json({ error: msg });

module.exports = { getSupabase, verifyToken, signToken, setCors, ok, err, ADMIN_GITHUB_USERNAME, BUCKET };
