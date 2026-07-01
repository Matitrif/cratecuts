import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { usuario, logout } = useAuth()

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <img src="/Cratecuts logo sin bg.png" alt="" className="navbar-logo-img" />
          Cratecuts
        </Link>
        <div className="navbar-links">
        <Link to="/albumes" className="navbar-link" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 8V21H3V8" />
            <rect x="1" y="3" width="22" height="5" rx="1" />
            <path d="M10 12h4" />
          </svg>
          COLECCIÓN
        </Link>
        <Link to="/listas" className="navbar-link" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          LISTAS
        </Link>
        <Link to="/albumes/buscar" className="navbar-icono" aria-label="Buscar álbum">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </Link>
        <Link to={`/perfil/${usuario?.id}`} className="label-mono" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
            overflow: 'hidden', background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.7rem', fontFamily: 'var(--font-display)',
          }}>
            {usuario?.foto_perfil
              ? <img src={usuario.foto_perfil} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : usuario?.nombreusuario?.charAt(0).toUpperCase()
            }
          </span>
          {usuario?.nombreusuario}
        </Link>
        <button className="navbar-logout" onClick={logout} aria-label="Cerrar sesión" title="Cerrar sesión">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
        </div>
      </div>
    </nav>
  )
}
