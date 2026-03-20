// api/programs/download.js — genera URL firmato per download
const { getSupabase, verifyToken, setCors, ok, err, BUCKET } = require('../_utils');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;
  if (!id) return err(res, 'ID mancante');

  const sb = getSupabase();
  const { data: prog, error } = await sb
    .from('programs')
    .select('id,file_path,original_name,status')
    .eq('id', id)
    .single();

  if (error || !prog)            return err(res, 'Programma non trovato', 404);
  if (prog.status !== 'approved') return err(res, 'Programma non disponibile', 403);

  // Genera URL firmato (valido 60 secondi)
  const { data: signed, error: signErr } = await sb.storage
    .from(BUCKET)
    .createSignedUrl(prog.file_path, 60, {
      download: prog.original_name,
    });

  if (signErr) return err(res, signErr.message, 500);

  // Incrementa contatore
  await sb.from('programs').update({ download_count: sb.rpc('increment') }).eq('id', id);
  // Supabase non supporta increment diretto così, usiamo raw SQL via rpc o re-fetch
  await sb.rpc('increment_downloads', { program_id: Number(id) }).catch(() => {
    // fallback: leggi e aggiorna
    sb.from('programs').select('download_count').eq('id', id).single().then(({ data }) => {
      if (data) sb.from('programs').update({ download_count: data.download_count + 1 }).eq('id', id);
    });
  });

  ok(res, { url: signed.signedUrl });
};
