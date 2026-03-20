import { Github, Code2, Server, Palette, Cpu } from 'lucide-react';

const CONTRIBUTORS = [
  { username:'CosmoUniverso', name:'Cosmo',    role:'Lead Developer', contributions:['Backend','Database','Auth','Deploy'],    color:'var(--accent)',  icon:<Server  size={14}/> },
  { username:'gabrielerada07',name:'Gabriele', role:'Collaboratore',  contributions:['Frontend','UI/UX','Testing'], color:'#a78bfa', icon:<Palette size={14}/> },
];

const TECH = [
  { name:'React 18',     desc:'Frontend UI',         color:'#61dafb' },
  { name:'Vite',         desc:'Build tool',           color:'#fbbf24' },
  { name:'Vercel',       desc:'Hosting & Serverless', color:'#fff' },
  { name:'Supabase',     desc:'DB & Storage',         color:'#3ecf8e' },
  { name:'GitHub OAuth', desc:'Autenticazione',       color:'var(--accent)' },
  { name:'JWT',          desc:'Sessioni',             color:'#e879f9' },
];

export default function Contributors() {
  return (
    <div className="page">
      <div className="fade-up" style={{marginBottom:36}}>
        <h1 style={{fontFamily:'var(--font-mono)',fontSize:28,fontWeight:700}}>
          <span style={{color:'var(--accent)'}}>{'//'} </span>Contributori
        </h1>
        <p style={{color:'var(--text-muted)',fontSize:13,marginTop:4,fontFamily:'var(--font-mono)'}}>
          Le persone che hanno realizzato JarStore
        </p>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:16,marginBottom:48}} className="fade-up">
        {CONTRIBUTORS.map(c => (
          <div key={c.username} className="card" style={{padding:24}}>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
              <img src={`https://github.com/${c.username}.png?size=80`} alt={c.username}
                style={{width:52,height:52,borderRadius:'50%',border:`2px solid ${c.color}`}}
                onError={e=>{e.target.style.display='none';}}/>
              <div>
                <p style={{fontFamily:'var(--font-mono)',fontSize:15,fontWeight:700}}>{c.name}</p>
                <p style={{fontSize:12,color:c.color,display:'flex',alignItems:'center',gap:4,marginTop:2}}>
                  {c.icon}{c.role}
                </p>
              </div>
              <a href={`https://github.com/${c.username}`} target="_blank" rel="noreferrer"
                className="btn btn-ghost btn-sm" style={{marginLeft:'auto'}}>
                <Github size={14}/>
              </a>
            </div>
            <div className="glow-line" style={{marginBottom:14}}/>
            <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
              {c.contributions.map(t=><span key={t} className="badge badge-cyan">{t}</span>)}
            </div>
          </div>
        ))}
      </div>

      <div className="fade-up">
        <h2 style={{fontFamily:'var(--font-mono)',fontSize:16,display:'flex',alignItems:'center',gap:8,marginBottom:16}}>
          <Code2 size={18} style={{color:'var(--accent)'}}/>Stack tecnologico
        </h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))',gap:10,marginBottom:32}}>
          {TECH.map(t=>(
            <div key={t.name} className="card" style={{padding:'12px 16px',display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:10,height:10,borderRadius:'50%',background:t.color,flexShrink:0}}/>
              <div>
                <p style={{fontFamily:'var(--font-mono)',fontSize:13,fontWeight:700}}>{t.name}</p>
                <p style={{fontSize:11,color:'var(--text-muted)'}}>{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:'var(--radius-lg)',padding:'20px 24px',display:'flex',alignItems:'center',gap:16}} className="fade-up">
        <Cpu size={20} color="var(--accent)"/>
        <div>
          <p style={{fontSize:13,fontWeight:600,color:'var(--text-secondary)'}}>Codice sorgente</p>
          <a href="https://github.com/CosmoUniverso/TpsitDemoLab" target="_blank" rel="noreferrer"
            style={{fontFamily:'var(--font-mono)',fontSize:13,color:'var(--accent)'}}>
            github.com/CosmoUniverso/TpsitDemoLab
          </a>
        </div>
        <a href="https://github.com/CosmoUniverso/TpsitDemoLab" target="_blank" rel="noreferrer"
          className="btn btn-ghost btn-sm" style={{marginLeft:'auto'}}>
          <Github size={14}/>GitHub
        </a>
      </div>
    </div>
  );
}
