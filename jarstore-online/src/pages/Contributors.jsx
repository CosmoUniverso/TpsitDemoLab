import { useState, useEffect } from 'react';
import { Github, Code2, Cpu } from 'lucide-react';
import { apiFetch, STATUS_LABELS } from '../hooks/useAuth.jsx';

const HARDCODED = [
  { username:'CosmoUniverso', name:'Cosmo',    role:'Lead Developer & Superadmin', contributions:['Backend','Auth','Deploy','DB'] },
  { username:'gabrielerada07', name:'Gabriele', role:'Collaboratore',               contributions:['Frontend','UI/UX','Testing'] },
];

const TECH = [
  { name:'React 18',    desc:'Frontend',         color:'#61dafb' },
  { name:'Vite',        desc:'Build tool',        color:'#fbbf24' },
  { name:'Vercel',      desc:'Hosting/Serverless',color:'#fff' },
  { name:'Supabase',    desc:'DB & Storage',      color:'#3ecf8e' },
  { name:'GitHub OAuth',desc:'Autenticazione',    color:'var(--accent)' },
  { name:'JWT',         desc:'Sessioni',          color:'#e879f9' },
];

export default function Contributors() {
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    apiFetch('/api/admin/data?type=contributors').then(setAdmins).catch(()=>{});
  }, []);

  return (
    <div className="page">
      <div className="fade-up" style={{marginBottom:32}}>
        <h1 style={{fontFamily:'var(--font-mono)',fontSize:26,fontWeight:700}}>
          <span style={{color:'var(--accent)'}}>{'//'} </span>Contributori
        </h1>
        <p style={{color:'var(--text-muted)',fontSize:12,marginTop:4,fontFamily:'var(--font-mono)'}}>
          Chi ha realizzato e gestisce JarStore
        </p>
      </div>

      {/* Contributori hardcoded */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:14,marginBottom:40}} className="fade-up">
        {HARDCODED.map(c=>(
          <div key={c.username} className="card" style={{padding:20}}>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
              <img src={`https://github.com/${c.username}.png?size=80`} alt={c.username}
                style={{width:48,height:48,borderRadius:'50%',border:'2px solid var(--accent)',flexShrink:0}}
                onError={e=>{e.target.style.display='none';}}/>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontFamily:'var(--font-mono)',fontSize:14,fontWeight:700}}>{c.name}</p>
                <p style={{fontSize:11,color:'var(--accent)',marginTop:2}}>{c.role}</p>
              </div>
              <a href={`https://github.com/${c.username}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                <Github size={13}/>
              </a>
            </div>
            <div className="glow-line" style={{marginBottom:12}}/>
            <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
              {c.contributions.map(t=><span key={t} className="badge badge-cyan">{t}</span>)}
            </div>
          </div>
        ))}
      </div>

      {/* Admin dal DB */}
      {admins.length > 0 && (
        <div className="fade-up" style={{marginBottom:40}}>
          <h2 style={{fontFamily:'var(--font-mono)',fontSize:14,display:'flex',alignItems:'center',gap:8,marginBottom:14,color:'var(--text-secondary)'}}>
            Admin attivi
          </h2>
          <div style={{display:'flex',flexWrap:'wrap',gap:10}}>
            {admins.map(a=>{
              const sl = STATUS_LABELS[a.user_status]||{};
              return (
                <a key={a.id} href={`https://github.com/${a.github_username}`} target="_blank" rel="noreferrer"
                  style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',textDecoration:'none',transition:'border-color var(--transition)'}}>
                  <img src={a.avatar_url||'https://github.com/ghost.png'} style={{width:26,height:26,borderRadius:'50%'}} alt=""/>
                  <span style={{fontFamily:'var(--font-mono)',fontSize:12,color:'var(--text-primary)'}}>@{a.github_username}</span>
                  <span className={`badge ${sl.cls||'badge-gray'}`} style={{fontSize:9}}>{sl.label}</span>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Stack */}
      <div className="fade-up" style={{marginBottom:32}}>
        <h2 style={{fontFamily:'var(--font-mono)',fontSize:14,display:'flex',alignItems:'center',gap:8,marginBottom:14,color:'var(--text-secondary)'}}>
          <Code2 size={15} style={{color:'var(--accent)'}}/>Stack tecnologico
        </h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))',gap:8}}>
          {TECH.map(t=>(
            <div key={t.name} className="card" style={{padding:'10px 14px',display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:t.color,flexShrink:0}}/>
              <div>
                <p style={{fontFamily:'var(--font-mono)',fontSize:12,fontWeight:700}}>{t.name}</p>
                <p style={{fontSize:10,color:'var(--text-muted)'}}>{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Repo */}
      <div style={{display:'flex',alignItems:'center',gap:14,padding:'16px 20px',background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:'var(--radius-lg)',flexWrap:'wrap'}} className="fade-up">
        <Cpu size={18} color="var(--accent)"/>
        <div style={{flex:1,minWidth:0}}>
          <p style={{fontSize:12,color:'var(--text-secondary)'}}>Codice sorgente</p>
          <a href="https://github.com/CosmoUniverso/TpsitDemoLab" target="_blank" rel="noreferrer"
            style={{fontFamily:'var(--font-mono)',fontSize:12,color:'var(--accent)',wordBreak:'break-all'}}>
            github.com/CosmoUniverso/TpsitDemoLab
          </a>
        </div>
        <a href="https://github.com/CosmoUniverso/TpsitDemoLab" target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
          <Github size={13}/>GitHub
        </a>
      </div>
    </div>
  );
}
