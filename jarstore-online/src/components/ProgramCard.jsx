import { useState } from 'react';
import { Download, Terminal, HardDrive, Calendar } from 'lucide-react';
import { apiFetch } from '../hooks/useAuth.jsx';

const fmtSize = b => b ? (b>=1048576 ? `${(b/1048576).toFixed(1)} MB` : `${(b/1024).toFixed(0)} KB`) : '—';
const fmtDate = s => new Date(s).toLocaleDateString('it-IT',{day:'2-digit',month:'short',year:'numeric'});

export function ProgramCard({ program, onDownload }) {
  const [showHow, setShowHow]     = useState(false);
  const [downloading, setDownloading] = useState(false);
  const tags = program.tags ? program.tags.split(',').map(t=>t.trim()).filter(Boolean) : [];

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { url } = await apiFetch(`/api/programs/download?id=${program.id}`);
      const a = document.createElement('a');
      a.href = url; a.download = program.original_name; a.click();
      onDownload?.();
    } catch (e) {
      alert('Errore download: ' + e.message);
    } finally {
      setTimeout(() => setDownloading(false), 1500);
    }
  };

  return (
    <>
      <div className="card fade-up" style={S.card}>
        <div style={S.header}>
          <div style={S.icon}>☕</div>
          <div style={{flex:1}}>
            <h3 style={S.name}>{program.name}</h3>
            <span style={S.ver}>v{program.version}</span>
          </div>
        </div>
        {program.description && <p style={S.desc}>{program.description}</p>}
        {tags.length>0 && <div style={S.tags}>{tags.map((t,i)=><span key={i} className="badge badge-purple">{t}</span>)}</div>}
        <div className="glow-line" style={{margin:'14px 0'}}/>
        <div style={S.footer}>
          <div style={S.stats}>
            <span style={S.stat}><HardDrive size={12}/>{fmtSize(program.file_size)}</span>
            <span style={S.stat}><Download  size={12}/>{program.download_count}</span>
            <span style={S.stat}><Calendar  size={12}/>{fmtDate(program.created_at)}</span>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button className="btn btn-ghost btn-sm" onClick={()=>setShowHow(true)}><Terminal size={14}/>Come usare</button>
            <button className="btn btn-primary btn-sm" onClick={handleDownload} disabled={downloading}>
              {downloading ? <span className="spinner" style={{width:14,height:14}}/> : <Download size={14}/>}
              Download
            </button>
          </div>
        </div>
      </div>

      {showHow && (
        <div className="modal-overlay" onClick={()=>setShowHow(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <h3 style={{fontFamily:'var(--font-mono)',marginBottom:16}}>Come eseguire {program.name}</h3>
            <p style={{color:'var(--text-secondary)',fontSize:14,marginBottom:12}}>Scarica il file ed eseguilo con Java:</p>
            <code style={{display:'block',padding:'12px 16px',background:'var(--bg-base)',borderRadius:'var(--radius-sm)',fontSize:13}}>java -jar {program.original_name}</code>
            <p style={{color:'var(--text-muted)',fontSize:12,marginTop:10}}>Serve Java installato: <a href="https://adoptium.net" target="_blank" rel="noreferrer">adoptium.net</a></p>
            <div style={{display:'flex',gap:10,marginTop:20,justifyContent:'flex-end'}}>
              <button className="btn btn-ghost btn-sm" onClick={()=>setShowHow(false)}>Chiudi</button>
              <button className="btn btn-primary btn-sm" onClick={()=>{handleDownload();setShowHow(false);}}>
                <Download size={14}/>Scarica ora
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const S = {
  card:   { padding:20, display:'flex', flexDirection:'column' },
  header: { display:'flex', alignItems:'flex-start', gap:12, marginBottom:12 },
  icon:   { width:42, height:42, borderRadius:10, background:'var(--bg-elevated)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 },
  name:   { fontFamily:'var(--font-mono)', fontSize:15, fontWeight:700, marginBottom:2 },
  ver:    { fontSize:12, color:'var(--accent)', fontFamily:'var(--font-mono)' },
  desc:   { fontSize:13, color:'var(--text-secondary)', lineHeight:1.5, marginBottom:10 },
  tags:   { display:'flex', flexWrap:'wrap', gap:6 },
  footer: { display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' },
  stats:  { display:'flex', gap:12 },
  stat:   { display:'flex', alignItems:'center', gap:4, fontSize:12, color:'var(--text-muted)' },
};
