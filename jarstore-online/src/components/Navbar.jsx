import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, STATUS_LABELS } from '../hooks/useAuth.jsx';
import { Package, Shield, LogOut, Home, Upload, Users } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isAdmin = ['admin','superadmin','teacher'].includes(user?.user_status);
  const active = (p) => ({ ...S.link, ...(pathname === p ? S.linkOn : {}) });
  const sl = user ? STATUS_LABELS[user.user_status] : null;

  return (
    <nav style={S.nav}>
      <div style={S.inner} className="nav-inner">
        <Link to="/" style={S.logo}>
          <Package size={20} color="var(--accent)" />
          <span style={S.logoTxt}>JarStore</span>
        </Link>
        <div style={S.links} className="nav-links">
          {user && <Link to="/"             style={active('/')}            ><Home   size={15}/>Programmi</Link>}
          {user && ['active','whitelisted','admin','superadmin','teacher'].includes(user.user_status) &&
                   <Link to="/submit"       style={active('/submit')}      ><Upload size={15}/>Carica</Link>}
          {user && <Link to="/contributors" style={active('/contributors')}><Users  size={15}/>Credits</Link>}
          {isAdmin && <Link to="/admin"     style={active('/admin')}       ><Shield size={15}/>Admin</Link>}
        </div>
        {user ? (
          <div style={S.userArea} className="nav-user">
            <img src={user.avatar_url} alt={user.github_username} style={S.avatar}/>
            <span style={S.uname} className="nav-username">
              {user.github_username}
              {sl && <span className={`badge ${sl.cls}`} style={{fontSize:10,marginLeft:6}}>{sl.label}</span>}
            </span>
            <button onClick={() => { logout(); navigate('/login'); }} className="btn btn-ghost btn-sm"><LogOut size={15}/></button>
          </div>
        ) : (
          <Link to="/login" className="btn btn-primary btn-sm" style={{marginLeft:'auto'}}>Accedi</Link>
        )}
      </div>
    </nav>
  );
}

const S = {
  nav:     { position:'fixed', top:0, left:0, right:0, zIndex:100, background:'rgba(6,10,15,0.9)', backdropFilter:'blur(12px)', borderBottom:'1px solid var(--border)' },
  inner:   { maxWidth:1280, margin:'0 auto', padding:'0 20px', height:'var(--nav-height)', display:'flex', alignItems:'center', gap:16 },
  logo:    { display:'flex', alignItems:'center', gap:10, textDecoration:'none', flexShrink:0 },
  logoTxt: { fontFamily:'var(--font-mono)', fontSize:16, fontWeight:700, color:'var(--text-primary)' },
  links:   { display:'flex', alignItems:'center', gap:4, flex:1 },
  link:    { display:'flex', alignItems:'center', gap:6, padding:'6px 10px', borderRadius:'var(--radius-sm)', fontSize:13, color:'var(--text-secondary)', textDecoration:'none', transition:'all var(--transition)', whiteSpace:'nowrap' },
  linkOn:  { color:'var(--accent)', background:'var(--accent-dim)' },
  userArea:{ display:'flex', alignItems:'center', gap:8, marginLeft:'auto', flexShrink:0 },
  avatar:  { width:28, height:28, borderRadius:'50%', border:'2px solid var(--border)', flexShrink:0 },
  uname:   { fontSize:13, fontWeight:500, color:'var(--text-secondary)', display:'flex', alignItems:'center', whiteSpace:'nowrap' },
};
