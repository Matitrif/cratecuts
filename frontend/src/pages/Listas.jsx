import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { listarListas, crearLista } from '../api/listas'

export default function Listas() {
  const { usuario } = useAuth()
  const [listas, setListas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [creando, setCreando] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [esPublica, setEsPublica] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!usuario) return
    listarListas(usuario.id)
      .then((res) => setListas(res.data))
      .finally(() => setCargando(false))
  }, [usuario])

  async function manejarCrear(e) {
    e.preventDefault()
    if (!titulo.trim()) return
    setGuardando(true)
    setError('')
    try {
      const res = await crearLista({
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || null,
        es_publica: esPublica,
      })
      setListas((prev) => [{ ...res.data, num_albumes: 0 }, ...prev])
      setTitulo('')
      setDescripcion('')
      setEsPublica(true)
      setCreando(false)
    } catch {
      setError('No se pudo crear la lista.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div>
      <Navbar />
      <div className="contenido">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.8rem' }}>
            Mis listas
          </h1>
          {!creando && (
            <button className="btn-primary" onClick={() => setCreando(true)}>Nueva lista</button>
          )}
        </div>

        {creando && (
          <form onSubmit={manejarCrear} className="mi-review-card" style={{ maxWidth: '520px' }}>
            <div className="campo-form">
              <label className="label-mono">Título</label>
              <input
                className="input-field"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Mis discos favoritos de 2025"
                autoFocus
              />
            </div>
            <div className="campo-form">
              <label className="label-mono">Descripción</label>
              <textarea
                className="textarea-field"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Una breve descripción (opcional)"
                rows={2}
              />
            </div>
            <div className="campo-form">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={esPublica} onChange={(e) => setEsPublica(e.target.checked)} />
                <span className="label-mono">Lista pública</span>
              </label>
            </div>
            {error && <p className="mensaje-error" style={{ marginBottom: '1rem' }}>{error}</p>}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-primary" type="submit" disabled={guardando}>
                {guardando ? 'Creando...' : 'Crear lista'}
              </button>
              <button type="button" className="btn-link" onClick={() => { setCreando(false); setError('') }}>
                Cancelar
              </button>
            </div>
          </form>
        )}

        {cargando ? (
          <p className="label-mono">Cargando...</p>
        ) : listas.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)' }}>Todavía no has creado ninguna lista.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: creando ? '2rem' : 0 }}>
            {listas.map((lista) => (
              <Link
                key={lista.id}
                to={`/listas/${lista.id}`}
                className="resultado-busqueda-item"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="resultado-busqueda-info">
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{lista.titulo}</p>
                  <p className="label-mono">
                    {lista.num_albumes} {lista.num_albumes === 1 ? 'álbum' : 'álbumes'}
                  </p>
                </div>
                <span className="etiqueta-anadido">{lista.es_publica ? 'Pública' : 'Privada'}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
