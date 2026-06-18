import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

export default function Inicio() {
  const { usuario } = useAuth()

  return (
    <div>
      <Navbar />
      <div className="contenido">
        <p className="label-mono">Sesión iniciada como</p>
        <p style={{ fontSize: '1.3rem', fontFamily: 'var(--font-display)', marginBottom: '1.5rem' }}>
          {usuario?.nombreusuario}
        </p>

        <Link to="/albumes" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
          Ver colección
        </Link>
      </div>
    </div>
  )
}