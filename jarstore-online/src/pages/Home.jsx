import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, apiFetch } from '../hooks/useAuth.jsx';
import { useToast } from '../hooks/useToast.js';
import { ToastContainer } from '../components/ToastContainer.jsx';
import { ProgramCard } from '../components/ProgramCard.jsx';
import { Search, RefreshCw, Upload, Package } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const toast    = useToast();
  const [programs, setPrograms] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [query,    setQuery]    = useState('');

  useEffect(() => { if (!loading && !user) navigate('/login'); }, [user, loading]);

  const fetchPrograms = useCallback(async () => {
    setFetching(true);
    try { setPrograms(await apiFetch('/api/programs')); }
    catch (e) { toast.error(e.message); }
    finally { setFetching(false); }
  }, []);

  useEffect(() => { fetchPrograms(); }, []);

  const filtered = programs.filter(p =>
    !query ||
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.description?.toLowerCase().includes(query.toLowerCase()) ||
    p.tags?.toLowerCase().includes(query.toLowerCase())
  );

  if (loading) return <Spinner/>;

  return (
    <>
      <div className="page-wide">
        <div style={S.header} className="fade-up">
          <div>
            <h1 style={S.title}><span style={{color:'var(--accent)'}}>{'//'} </span>Programmi</h1>
            <p style={S.sub}>{programs.length} programm{programs.length===1?'o':'i'} disponibil{programs.length===1?'e':'i'}</p>
          </div>
          <div style={{display:'flex',gap:10}}>
            <button className="btn btn-ghost btn-sm" onClick={fetchPrograms} disabled={fetching}>
              <RefreshCw size={14} style={fetching?{animation:'spin .7s linear infinite'}:{}}/>Aggiorna
            </button>
            <button className="btn btn-primary btn-sm" onClick={()=>navigate('/submit')}>
              <Upload size={14}/>Carica il tuo
            </button>
          </div>
        </div>

        <div style={S.searchWrap} className="fade-up">
          <Search size={16} color="var(--text-muted)" style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)'}}/>
          <input className="input" style={{paddingLeft:40}} placeholder="Cerca programmi…" value={query} onChange={e=>setQuery(e.target.value)}/>
        </div>

        {fetching ? (
          <div style={{display:'flex',justifyContent:'center',padding:'60px 0'}}><div className="spinner" style={{width:28,height:28}}/></div>
        ) : filtered.length === 0 ? (
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'80px 0'}}>
            <Package size={48} color="var(--text-muted)"/>
            <p style={{color:'var(--text-secondary)',marginTop:12,fontFamily:'var(--font-mono)'}}>
              {query ? 'Nessun risultato' : 'Nessun programma ancora'}
            </p>
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:16}}>
            {filtered.map(p => <ProgramCard key={p.id} program={p} onDownload={fetchPrograms}/>)}
          </div>
        )}
      </div>
      <ToastContainer toasts={toast.toasts}/>
    </>
  );
}

function Spinner() {
  return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}><div className="spinner" style={{width:32,height:32,borderWidth:3}}/></div>;
}

const S = {
  header:     { display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:28, flexWrap:'wrap', gap:16 },
  title:      { fontFamily:'var(--font-mono)', fontSize:28, fontWeight:700 },
  sub:        { color:'var(--text-muted)', fontSize:13, marginTop:4, fontFamily:'var(--font-mono)' },
  searchWrap: { position:'relative', marginBottom:28, maxWidth:480 },
};
