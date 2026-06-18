import { useAuth } from '../context/AuthContext'

export default function Inicio() {
  const { usuario, logout } = useAuth()

  return (
    <div style={{ padding: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem' }}>Cratecuts</h1>
        <button className="btn-link" onClick={logout}>Cerrar sesión</button>
      </div>

      <p className="label-mono">Sesión iniciada como</p>
      <p style={{ fontSize: '1.3rem', fontFamily: 'var(--font-display)' }}>{usuario?.nombreusuario}</p>
    </div>
  )
}