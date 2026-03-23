const { getSupabase, verifyToken, setCors, ok, err, isAdmin, canViewAdmin, BUCKET } = require('../_utils');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;
  if (!id) return err(res, 'ID mancante');

  const sb = getSupabase();

  // GET: download (pubblico)
  if (req.method === 'GET') {
    const { data: prog, error } = await sb
      .from('programs')
      .select('id,file_path,original_name,status,download_count')
      .eq('id', id).single();
    if (error || !prog)             return err(res, 'Programma non trovato', 404);
    if (prog.status !== 'approved') return err(res, 'Non disponibile', 403);
    if (!prog.file_path)            return err(res, 'File non trovato', 404);

    const { data: signed, error: sErr } = await sb.storage
      .from(BUCKET).createSignedUrl(prog.file_path, 60, { download: prog.original_name });
    if (sErr || !signed?.signedUrl) return err(res, 'Errore URL: ' + (sErr?.message||''), 500);

    await sb.rpc('increment_downloads', { program_id: Number(id) });
    return ok(res, { url: signed.signedUrl });
  }

  // Per altre operazioni serve auth
  const user = verifyToken(req);
  if (!user) return err(res, 'Non autenticato', 401);

  const { data: prog, error: pErr } = await sb
    .from('programs')
    .select('id,name,description,version,tags,contributors,status,file_path,original_name,uploader_id,users!uploader_id(github_username)')
    .eq('id', id).single();
  if (pErr || !prog) return err(res, 'Programma non trovato', 404);

  const isOwner   = prog.uploader_id === user.id;
  const contribs  = (prog.contributors||'').split(',').map(s=>s.trim().replace('@','').toLowerCase());
  const isContrib = contribs.includes(user.github_username?.toLowerCase());
  const hasAccess = isAdmin(user.user_status) || isOwner || isContrib;

  // Teacher: può solo vedere (download già gestito sopra via GET)
  if (user.user_status === 'teacher') return err(res, 'I teacher non possono modificare programmi', 403);

  if (!hasAccess) return err(res, 'Nessun permesso su questo programma', 403);

  // DELETE
  if (req.method === 'DELETE') {
    if (prog.file_path) await sb.storage.from(BUCKET).remove([prog.file_path]).catch(console.error);
    const { error } = await sb.from('programs').delete().eq('id', id);
    if (error) return err(res, error.message, 500);
    return ok(res, { success: true });
  }

  // PATCH: aggiorna metadati
  if (req.method === 'PATCH') {
    const { name, description, version, tags, contributors } = req.body || {};
    const updates = { updated_at: new Date().toISOString() };
    if (name         !== undefined) updates.name         = name.trim();
    if (description  !== undefined) updates.description  = description.trim();
    if (version      !== undefined) updates.version      = version.trim() || '1.0.0';
    if (tags         !== undefined) updates.tags         = tags.trim();
    if (contributors !== undefined) updates.contributors = contributors.trim();
    const { error } = await sb.from('programs').update(updates).eq('id', id);
    if (error) return err(res, error.message, 500);
    return ok(res, { success: true });
  }

  // PUT: sostituisce il file JAR
  if (req.method === 'PUT') {
    const { newFilePath, newOriginalName, newFileSize } = req.body || {};
    if (!newFilePath || !newOriginalName) return err(res, 'Dati file mancanti');

    // Elimina vecchio file
    if (prog.file_path && prog.file_path !== newFilePath) {
      await sb.storage.from(BUCKET).remove([prog.file_path]).catch(console.error);
    }

    const { error } = await sb.from('programs').update({
      file_path:     newFilePath,
      original_name: newOriginalName,
      file_size:     newFileSize || 0,
      updated_at:    new Date().toISOString(),
    }).eq('id', id);
    if (error) return err(res, error.message, 500);
    return ok(res, { success: true });
  }

  return err(res, 'Method not allowed', 405);
};
