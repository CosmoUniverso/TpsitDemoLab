// api/admin/queue.js — GET coda + POST revisione (unificati per rispettare limite 12 funzioni Vercel Hobby)
const { getSupabase, verifyToken, setCors, ok, err, isAdmin, BUCKET } = require('../_utils');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = verifyToken(req);
  if (!isAdmin(user?.user_status)) return err(res, 'Accesso negato', 403);

  const sb = getSupabase();

  // ── GET: coda programmi pending + utenti pending ──────────────────────────
  if (req.method === 'GET') {
    const [{ data: programs, error: pErr }, { data: pendingUsers, error: uErr }] = await Promise.all([
      sb.from('programs')
        .select('id,name,description,version,tags,contributors,status,original_name,file_size,admin_note,created_at,uploader_id,users!uploader_id(github_username,avatar_url,github_public_repos,github_created_at,user_status)')
        .eq('status', 'pending')
        .order('created_at', { ascending: true }),
      sb.from('users')
        .select('id,github_username,avatar_url,email,github_public_repos,github_created_at,created_at')
        .eq('user_status', 'pending')
        .order('created_at', { ascending: true }),
    ]);

    if (pErr) return err(res, pErr.message, 500);
    if (uErr) return err(res, uErr.message, 500);

    const queue = (programs || []).map(p => ({
      ...p,
      uploader:             p.users?.github_username     || null,
      uploader_avatar:      p.users?.avatar_url          || null,
      uploader_repos:       p.users?.github_public_repos || 0,
      uploader_created:     p.users?.github_created_at   || null,
      uploader_status:      p.users?.user_status         || null,
      users:                undefined,
    }));

    return ok(res, { programs: queue, pendingUsers: pendingUsers || [] });
  }

  // ── POST: approva o rifiuta un programma ──────────────────────────────────
  if (req.method === 'POST') {
    const { id, action, note } = req.body || {};
    if (!id || !['approve','reject'].includes(action)) return err(res, 'Parametri non validi');

    if (action === 'approve') {
      const { error } = await sb
        .from('programs')
        .update({ status: 'approved', admin_note: note||null, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) return err(res, error.message, 500);
      return ok(res, { success: true });
    }

    // reject: elimina file da storage
    const { data: prog } = await sb.from('programs').select('file_path').eq('id', id).single();
    if (prog?.file_path) {
      await sb.storage.from(BUCKET).remove([prog.file_path]).catch(console.error);
    }
    const { error } = await sb
      .from('programs')
      .update({ status: 'rejected', admin_note: note||'Submission rifiutata.', updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) return err(res, error.message, 500);
    return ok(res, { success: true });
  }

  return err(res, 'Method not allowed', 405);
};
