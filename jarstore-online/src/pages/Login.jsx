import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { Package, AlertCircle } from 'lucide-react';

const ERROR_MSG = {
  banned:      '🚫 Il tuo account è stato sospeso.',
  auth_failed: 'Autenticazione fallita. Riprova.',
  no_code:     'Codice OAuth mancante. Riprova.',
};

export default function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const error = params.get('error');
  useEffect(() => { if (user) navigate('/'); }, [user, navigate]);

  return (
    <div style={S.wrap}>
      <div style={S.blob1}/><div style={S.blob2}/>
      <div className="card fade-up" style={S.card}>
        <div style={{textAlign:'center'}}>
          <div style={S.iconBox}><Package size={28} color="var(--accent)"/></div>
          <h1 style={S.title}>JarStore</h1>
          <p style={S.sub}>Software Repository — Powered by GitHub</p>
        </div>
        <div className="glow-line" style={{margin:'28px 0'}}/>
        <h2 style={{fontFamily:'var(--font-mono)',fontSize:18,marginBottom:8}}>Accedi al repository</h2>
        <p style={{fontSize:14,color:'var(--text-secondary)',marginBottom:24,lineHeight:1.6}}>
          Sfoglia e scarica i programmi. Carica i tuoi progetti per farli revisionare dall'admin.
        </p>
        {error && (
          <div style={S.errBox}><AlertCircle size={16}/>{ERROR_MSG[error] || 'Si è verificato un errore.'}</div>
        )}
        <a href="/api/auth/github" style={S.ghBtn}>
          <GhIcon/> Continua con GitHub
        </a>
        <p style={{fontSize:12,color:'var(--text-muted)',textAlign:'center',lineHeight:1.7,marginTop:16}}>
          Anti-spam attivo: account GitHub &gt;5 giorni + almeno 1 repo pubblico.<br/>
          Admin: <code>CosmoUniverso</code>
        </p>
      </div>
    </div>
  );
}

function GhIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  );
}

const S = {
  wrap:    { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24, position:'relative', overflow:'hidden' },
  blob1:   { position:'absolute', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(0,210,255,0.08) 0%,transparent 70%)', top:'-20%', left:'10%', pointerEvents:'none' },
  blob2:   { position:'absolute', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(124,58,237,0.06) 0%,transparent 70%)', bottom:'-10%', right:'5%', pointerEvents:'none' },
  card:    { padding:'40px 44px', width:'100%', maxWidth:420, position:'relative', boxShadow:'0 32px 80px rgba(0,0,0,0.4)' },
  iconBox: { width:60, height:60, borderRadius:16, background:'var(--bg-elevated)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', boxShadow:'0 0 24px rgba(0,210,255,0.15)' },
  title:   { fontFamily:'var(--font-mono)', fontSize:26, fontWeight:700 },
  sub:     { fontSize:13, color:'var(--text-muted)', marginTop:4 },
  errBox:  { display:'flex', alignItems:'center', gap:8, padding:'10px 14px', background:'rgba(248,81,73,0.08)', border:'1px solid rgba(248,81,73,0.3)', borderRadius:'var(--radius-sm)', color:'var(--danger)', fontSize:13, marginBottom:16 },
  ghBtn:   { display:'flex', alignItems:'center', justifyContent:'center', gap:12, width:'100%', padding:'13px 20px', background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', color:'var(--text-primary)', fontSize:15, fontWeight:600, cursor:'pointer', textDecoration:'none', transition:'all var(--transition)' },
};
