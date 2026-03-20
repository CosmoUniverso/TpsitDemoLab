// api/admin/review.js — approva o rifiuta una submission
const { getSupabase, verifyToken, setCors, ok, err, BUCKET } = require('../_utils');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return err(res, 'Method not allowed', 405);

  const user = verifyToken(req);
  if (!user?.is_admin) return err(res, 'Accesso negato', 403);

  const { id, action, note } = req.body || {};
  if (!id)                                    return err(res, 'ID mancante');
  if (!['approve','reject'].includes(action)) return err(res, 'Azione non valida');

  const sb = getSupabase();

  if (action === 'approve') {
    const { error } = await sb
      .from('programs')
      .update({ status: 'approved', admin_note: note || null, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) return err(res, error.message, 500);
    return ok(res, { success: true, status: 'approved' });
  }

  if (action === 'reject') {
    // Recupera il file_path per eliminarlo dallo storage
    const { data: prog } = await sb.from('programs').select('file_path').eq('id', id).single();

    // Elimina il file da Storage
    if (prog?.file_path) {
      await sb.storage.from(BUCKET).remove([prog.file_path]);
    }

    const { error } = await sb
      .from('programs')
      .update({ status: 'rejected', admin_note: note || 'Submission rifiutata.', updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) return err(res, error.message, 500);
    return ok(res, { success: true, status: 'rejected' });
  }
};
