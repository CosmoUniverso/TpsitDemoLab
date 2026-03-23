const { getSupabase, verifyToken, setCors, ok, err, isAdmin, BUCKET } = require('../_utils');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return err(res, 'Method not allowed', 405);

  const user = verifyToken(req);
  if (!isAdmin(user?.user_status)) return err(res, 'Accesso negato', 403);

  const { id, action, note } = req.body || {};
  if (!id || !['approve','reject'].includes(action)) return err(res, 'Parametri non validi');

  const sb = getSupabase();

  if (action === 'approve') {
    const { error } = await sb
      .from('programs')
      .update({ status:'approved', admin_note: note||null, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) return err(res, error.message, 500);
    return ok(res, { success: true });
  }

  // Reject: elimina file da storage
  const { data: prog } = await sb.from('programs').select('file_path').eq('id', id).single();
  if (prog?.file_path) {
    await sb.storage.from(BUCKET).remove([prog.file_path]).catch(console.error);
  }

  const { error } = await sb
    .from('programs')
    .update({ status:'rejected', admin_note: note||'Submission rifiutata.', updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return err(res, error.message, 500);
  ok(res, { success: true });
};
