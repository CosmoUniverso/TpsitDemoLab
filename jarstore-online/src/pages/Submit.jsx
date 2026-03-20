import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { useAuth, apiFetch } from '../hooks/useAuth.jsx';
import { useToast } from '../hooks/useToast.js';
import { ToastContainer } from '../components/ToastContainer.jsx';
import { Upload, FileCode, XCircle, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase.js';

export default function Submit() {
  const { user, loading } = useAuth();
  const navigate  = useNavigate();
  const toast     = useToast();

  const [file,       setFile]       = useState(null);
  const [name,       setName]       = useState('');
  const [desc,       setDesc]       = useState('');
  const [version,    setVersion]    = useState('1.0.0');
  const [tags,       setTags]       = useState('');
  const [uploading,  setUploading]  = useState(false);
  const [progress,   setProgress]   = useState(0);
  const [step,       setStep]       = useState(''); // 'uploading' | 'submitting' | 'done'

  const onDrop = useCallback(accepted => {
    if (accepted[0]) { setFile(accepted[0]); if (!name) setName(accepted[0].name.replace('.jar','')); }
  }, [name]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: { 'application/java-archive': ['.jar'], 'application/octet-stream': ['.jar'] },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024, // 100MB
    onDropRejected: () => toast.error('Solo .jar fino a 100MB'),
  });

  const handleSubmit = async () => {
    if (!file)        return toast.error('Seleziona un file .jar');
    if (!name.trim()) return toast.error('Inserisci il nome del programma');
    setUploading(true);
    setProgress(0);

    try {
      // Step 1: ottieni URL firmato da Supabase via API
      setStep('uploading');
      const { uploadUrl, filePath } = await apiFetch('/api/upload-url', {
        method: 'POST',
        body: JSON.stringify({ filename: file.name }),
      });

      // Step 2: carica il file DIRETTAMENTE su Supabase (non passa per Vercel)
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener('progress', e => {
          if (e.lengthComputable) setProgress(Math.round(e.loaded / e.total * 100));
        });
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error('Upload fallito'));
        });
        xhr.addEventListener('error', () => reject(new Error('Errore di rete')));
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', 'application/java-archive');
        xhr.send(file);
      });

      // Step 3: registra la submission nel DB
      setStep('submitting');
      await apiFetch('/api/programs/submit', {
        method: 'POST',
        body: JSON.stringify({
          name:         name.trim(),
          description:  desc.trim(),
          version:      version.trim() || '1.0.0',
          tags:         tags.trim(),
          filePath,
          originalName: file.name,
          fileSize:     file.size,
        }),
      });

      setStep('done');
      toast.success('Programma inviato! Attendi la revisione dell\'admin.');
      setTimeout(() => navigate('/'), 2000);
    } catch (e) {
      toast.error(e.message);
      setStep('');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return null;
  if (!user) { navigate('/login'); return null; }

  const dropBorder = isDragReject ? 'var(--danger)' : isDragActive ? 'var(--accent)' : file ? 'var(--success)' : 'var(--border)';

  return (
    <>
      <div className="page" style={{maxWidth:680}}>
        <div className="fade-up" style={{marginBottom:28}}>
          <h1 style={{fontFamily:'var(--font-mono)',fontSize:28,fontWeight:700}}>
            <span style={{color:'var(--accent)'}}>{'//'} </span>Carica programma
          </h1>
          <p style={{color:'var(--text-muted)',fontSize:13,marginTop:4,fontFamily:'var(--font-mono)'}}>
            Il programma verrà revisionato dall'admin prima di essere pubblicato
          </p>
        </div>

        {/* Limiti anti-spam */}
        {!user.is_whitelisted && !user.is_admin && (
          <div style={S.infoBox} className="fade-up">
            <AlertCircle size={16} color="var(--warning)"/>
            <div style={{fontSize:13, color:'var(--text-secondary)'}}>
              <strong style={{color:'var(--warning)'}}>Limiti account standard:</strong> max 2 submission ogni 24h · max 2 in attesa contemporaneamente
            </div>
          </div>
        )}
        {user.is_whitelisted && (
          <div style={{...S.infoBox, borderColor:'rgba(63,185,80,0.3)', background:'rgba(63,185,80,0.06)'}} className="fade-up">
            <CheckCircle size={16} color="var(--success)"/>
            <span style={{fontSize:13, color:'var(--success)'}}>Account verificato — nessun limite di submission</span>
          </div>
        )}

        <div className="card fade-up" style={{padding:28, display:'flex', flexDirection:'column', gap:16, marginTop:16}}>
          {/* Dropzone */}
          <div {...getRootProps()} style={{...S.drop, borderColor:dropBorder, background:isDragActive?'var(--accent-dim)':file?'rgba(63,185,80,0.06)':'var(--bg-base)'}}>
            <input {...getInputProps()}/>
            {file ? (
              <div style={{display:'flex',alignItems:'center',gap:14,width:'100%'}}>
                <FileCode size={32} color="var(--success)"/>
                <div style={{flex:1}}>
                  <p style={{fontFamily:'var(--font-mono)',fontSize:14}}>{file.name}</p>
                  <p style={{fontSize:12,color:'var(--text-muted)',marginTop:2}}>{(file.size/1048576).toFixed(2)} MB</p>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={e=>{e.stopPropagation();setFile(null);}}>
                  <XCircle size={14}/>Rimuovi
                </button>
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:10,pointerEvents:'none'}}>
                <Upload size={36} color={isDragActive?'var(--accent)':'var(--text-muted)'}/>
                <p style={{fontFamily:'var(--font-mono)',fontSize:14,color:'var(--text-secondary)'}}>
                  {isDragActive ? 'Rilascia il .jar qui' : 'Trascina il .jar qui'}
                </p>
                <p style={{fontSize:12,color:'var(--text-muted)'}}>oppure clicca per sfogliare · max 100 MB</p>
              </div>
            )}
          </div>

          {/* Campi */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 130px',gap:12}}>
            <div style={S.field}>
              <label style={S.label}>Nome *</label>
              <input className="input" placeholder="Nome del programma" value={name} onChange={e=>setName(e.target.value)}/>
            </div>
            <div style={S.field}>
              <label style={S.label}>Versione</label>
              <input className="input" placeholder="1.0.0" value={version} onChange={e=>setVersion(e.target.value)}/>
            </div>
          </div>

          <div style={S.field}>
            <label style={S.label}>Descrizione</label>
            <textarea className="textarea" placeholder="Descrivi brevemente il programma…" value={desc} onChange={e=>setDesc(e.target.value)}/>
          </div>

          <div style={S.field}>
            <label style={S.label}>Tag <span style={{color:'var(--text-muted)',fontWeight:400}}>(separati da virgola)</span></label>
            <input className="input" placeholder="es: gioco, utility, demo" value={tags} onChange={e=>setTags(e.target.value)}/>
          </div>

          {/* Barra progresso */}
          {uploading && (
            <div>
              <div style={{height:6, background:'var(--bg-elevated)', borderRadius:3, overflow:'hidden'}}>
                <div style={{height:'100%', width:`${progress}%`, background:'linear-gradient(90deg,var(--accent),var(--accent2))', borderRadius:3, transition:'width .2s'}}/>
              </div>
              <p style={{fontSize:12,color:'var(--text-muted)',marginTop:6}}>
                {step === 'uploading'  && `Caricamento file… ${progress}%`}
                {step === 'submitting' && 'Registrazione submission…'}
              </p>
            </div>
          )}

          <button className="btn btn-primary" style={{justifyContent:'center'}} onClick={handleSubmit} disabled={uploading || !file}>
            {uploading ? <><span className="spinner" style={{width:16,height:16}}/> Invio in corso…</> : <><Upload size={16}/>Invia per revisione</>}
          </button>
        </div>
      </div>
      <ToastContainer toasts={toast.toasts}/>
    </>
  );
}

const S = {
  infoBox: { display:'flex', alignItems:'flex-start', gap:10, padding:'12px 16px', background:'rgba(210,153,34,0.06)', border:'1px solid rgba(210,153,34,0.3)', borderRadius:'var(--radius-md)', marginBottom:0 },
  drop:    { border:'2px dashed', borderRadius:'var(--radius-md)', padding:'28px 20px', cursor:'pointer', transition:'all var(--transition)', minHeight:130, display:'flex', alignItems:'center', justifyContent:'center' },
  field:   { display:'flex', flexDirection:'column', gap:6 },
  label:   { fontSize:12, fontWeight:600, color:'var(--text-secondary)', letterSpacing:'.04em', textTransform:'uppercase' },
};
