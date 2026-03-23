const { getSupabase, setCors, ok, err, BUCKET } = require('../_utils');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;
  if (!id) return err(res, 'ID mancante');

  const sb = getSupabase();

  const { data: prog, error } = await sb
    .from('programs')
    .select('id,file_path,original_name,status,download_count')
    .eq('id', id)
    .single();

  if (error || !prog)             return err(res, 'Programma non trovato', 404);
  if (prog.status !== 'approved') return err(res, 'Programma non disponibile', 403);
  if (!prog.file_path)            return err(res, 'File non trovato', 404);

  // Genera URL firmato valido 60 secondi
  const { data: signed, error: signErr } = await sb.storage
    .from(BUCKET)
    .createSignedUrl(prog.file_path, 60, { download: prog.original_name });

  if (signErr) return err(res, 'Errore generazione URL: ' + signErr.message, 500);
  if (!signed?.signedUrl) return err(res, 'URL firmato non generato', 500);

  // Incrementa download
  await sb.rpc('increment_downloads', { program_id: Number(id) });

  ok(res, { url: signed.signedUrl });
};
