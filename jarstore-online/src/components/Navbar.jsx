import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { Package, Shield, LogOut, Home, Upload, Users } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const active = (p) => ({ ...S.link, ...(pathname === p ? S.linkOn : {}) });

  return (
    <nav style={S.nav}>
      <div style={S.inner}>
        <Link to="/" style={S.logo}>
          <Package size={20} color="var(--accent)" />
          <span style={S.logoTxt}>JarStore</span>
        </Link>
        <div style={S.links}>
          {user && <Link to="/"            style={active('/')}            ><Home   size={15}/>Programmi</Link>}
          {user && <Link to="/submit"      style={active('/submit')}      ><Upload size={15}/>Carica</Link>}
          {user && <Link to="/contributors" style={active('/contributors')}><Users  size={15}/>Credits</Link>}
          {user?.is_admin && <Link to="/admin" style={active('/admin')}   ><Shield size={15}/>Admin</Link>}
        </div>
        {user ? (
          <div style={S.userArea}>
            <img src={user.avatar_url} alt={user.github_username} style={S.avatar}/>
            <span style={S.uname}>
              {user.github_username}
              {user.is_admin       && <span className="badge badge-cyan"   style={{fontSize:10,marginLeft:6}}>admin</span>}
              {user.is_whitelisted && <span className="badge badge-green"  style={{fontSize:10,marginLeft:4}}>✓</span>}
            </span>
            <button onClick={() => { logout(); navigate('/login'); }} className="btn btn-ghost btn-sm"><LogOut size={15}/></button>
          </div>
        ) : (
          <Link to="/login" className="btn btn-primary btn-sm">Accedi</Link>
        )}
      </div>
    </nav>
  );
}

const S = {
  nav:     { position:'fixed', top:0, left:0, right:0, zIndex:100, background:'rgba(6,10,15,0.85)', backdropFilter:'blur(12px)', borderBottom:'1px solid var(--border)' },
  inner:   { maxWidth:1280, margin:'0 auto', padding:'0 24px', height:58, display:'flex', alignItems:'center', gap:24 },
  logo:    { display:'flex', alignItems:'center', gap:10, textDecoration:'none', marginRight:8 },
  logoTxt: { fontFamily:'var(--font-mono)', fontSize:16, fontWeight:700, color:'var(--text-primary)' },
  links:   { display:'flex', alignItems:'center', gap:4, flex:1 },
  link:    { display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:'var(--radius-sm)', fontSize:14, color:'var(--text-secondary)', textDecoration:'none', transition:'all var(--transition)' },
  linkOn:  { color:'var(--accent)', background:'var(--accent-dim)' },
  userArea:{ display:'flex', alignItems:'center', gap:10, marginLeft:'auto' },
  avatar:  { width:30, height:30, borderRadius:'50%', border:'2px solid var(--border)' },
  uname:   { fontSize:13, fontWeight:500, color:'var(--text-secondary)', display:'flex', alignItems:'center' },
};
