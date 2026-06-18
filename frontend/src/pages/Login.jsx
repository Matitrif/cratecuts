import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [nombreusuario, setNombreusuario] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function manejarEnvio(e) {
    e.preventDefault()
    setError('')
    setEnviando(true)
    try {
      await login(nombreusuario, password)
      navigate('/')
    } catch {
      setError('Usuario o contraseña incorrectos')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div style={{ width: '340px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '0.3rem' }}>
           Cratecuts
        </h1>
        <p className="label-mono" style={{ marginBottom: '2rem' }}>Inicia sesión</p>

        <form onSubmit={manejarEnvio} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label className="label-mono">Usuario</label>
            <input
              className="input-field"
              value={nombreusuario}
              onChange={(e) => setNombreusuario(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label-mono">Contraseña</label>
            <input
              className="input-field"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="mensaje-error">{error}</p>}

          <button className="btn-primary" type="submit" disabled={enviando}>
            {enviando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          ¿No tienes cuenta? <Link to="/registro" className="btn-link">Regístrate</Link>
        </p>
      </div>
    </div>
  )
}