import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { usuario, logout } = useAuth()

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">Cratecuts</Link>
      <div className="navbar-links">
        <Link to="/albumes" className="navbar-link">Colección</Link>
        <Link to="/albumes/buscar" className="navbar-icono" aria-label="Buscar álbum">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </Link>
        <Link to={`/perfil/${usuario?.id}`} className="label-mono" style={{ color: 'inherit', textDecoration: 'none' }}>
          {usuario?.nombreusuario}
        </Link>
        <button className="btn-link" onClick={logout}>Cerrar sesión</button>
      </div>
    </nav>
  )
}