import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import {
  obtenerLista,
  actualizarLista,
  eliminarLista,
  anadirAlbumALista,
  quitarAlbumDeLista,
} from '../api/listas'
import { buscarAlbumesExternos } from '../api/musicbrainz'
import { crearAlbum } from '../api/albums'

export default function ListaInfo() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { usuario } = useAuth()

  const [lista, setLista] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [noEncontrada, setNoEncontrada] = useState(false)

  const [editando, setEditando] = useState(false)
  const [formTitulo, setFormTitulo] = useState('')
  const [formDescripcion, setFormDescripcion] = useState('')
  const [formPublica, setFormPublica] = useState(true)
  const [guardando, setGuardando] = useState(false)

  const [query, setQuery] = useState('')
  const [resultados, setResultados] = useState([])
  const [buscando, setBuscando] = useState(false)
  const [anadiendo, setAnadiendo] = useState(null)
  const [error, setError] = useState('')

  const esPropia = usuario && lista && usuario.id === lista.id_usuario

  useEffect(() => {
    obtenerLista(id)
      .then((res) => {
        setLista(res.data)
        setFormTitulo(res.data.titulo)
        setFormDescripcion(res.data.descripcion || '')
        setFormPublica(res.data.es_publica)
      })
      .catch(() => setNoEncontrada(true))
      .finally(() => setCargando(false))
  }, [id])

  async function guardarCambios(e) {
    e.preventDefault()
    if (!formTitulo.trim()) return
    setGuardando(true)
    setError('')
    try {
      const res = await actualizarLista(id, {
        titulo: formTitulo.trim(),
        descripcion: formDescripcion.trim() || null,
        es_publica: formPublica,
      })
      setLista(res.data)
      setEditando(false)
    } catch {
      setError('No se pudo guardar la lista.')
    } finally {
      setGuardando(false)
    }
  }

  async function borrarLista() {
    if (!window.confirm('¿Seguro que quieres eliminar esta lista?')) return
    try {
      await eliminarLista(id)
      navigate('/listas')
    } catch {
      setError('No se pudo eliminar la lista.')
    }
  }

  async function manejarBusqueda(e) {
    e.preventDefault()
    if (!query.trim()) return
    setBuscando(true)
    setError('')
    try {
      const res = await buscarAlbumesExternos(query)
      setResultados(res.data)
    } catch {
      setError('No se pudo conectar con MusicBrainz.')
    } finally {
      setBuscando(false)
    }
  }

  async function anadirResultado(resultado) {
    setAnadiendo(resultado.id_musicbrainz)
    setError('')
    try {
      const resAlbum = await crearAlbum(resultado)
      const res = await anadirAlbumALista(id, resAlbum.data.id)
      setLista(res.data)
    } catch {
      setError('No se pudo añadir el álbum.')
    } finally {
      setAnadiendo(null)
    }
  }

  async function quitarAlbum(idAlbum) {
    try {
      const res = await quitarAlbumDeLista(id, idAlbum)
      setLista(res.data)
    } catch {
      setError('No se pudo quitar el álbum.')
    }
  }

  if (cargando) return <p className="label-mono" style={{ padding: '3rem' }}>Cargando...</p>
  if (noEncontrada || !lista) {
    return (
      <div>
        <Navbar />
        <div className="contenido">
          <p style={{ color: 'var(--color-text-muted)' }}>Lista no encontrada o privada.</p>
        </div>
      </div>
    )
  }

  const mbEnLista = new Set(lista.albumes.map((a) => a.id_musicbrainz).filter(Boolean))

  return (
    <div>
      <Navbar />
      <div className="contenido">
        {!editando ? (
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.3rem' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '2rem' }}>
                {lista.titulo}
              </h1>
              <span className="etiqueta-anadido">{lista.es_publica ? 'Pública' : 'Privada'}</span>
            </div>
            {lista.descripcion && (
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>{lista.descripcion}</p>
            )}
            <p className="label-mono">
              {lista.albumes.length} {lista.albumes.length === 1 ? 'álbum' : 'álbumes'}
            </p>
            {esPropia && (
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.6rem' }}>
                <button className="btn-link" onClick={() => setEditando(true)}>Editar</button>
                <button className="btn-link" style={{ color: 'var(--color-error)' }} onClick={borrarLista}>
                  Eliminar lista
                </button>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={guardarCambios} className="mi-review-card" style={{ maxWidth: '520px' }}>
            <div className="campo-form">
              <label className="label-mono">Título</label>
              <input className="input-field" value={formTitulo} onChange={(e) => setFormTitulo(e.target.value)} />
            </div>
            <div className="campo-form">
              <label className="label-mono">Descripción</label>
              <textarea
                className="textarea-field"
                value={formDescripcion}
                onChange={(e) => setFormDescripcion(e.target.value)}
                rows={2}
              />
            </div>
            <div className="campo-form">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={formPublica} onChange={(e) => setFormPublica(e.target.checked)} />
                <span className="label-mono">Lista pública</span>
              </label>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-primary" type="submit" disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
              <button type="button" className="btn-link" onClick={() => {
                setEditando(false)
                setFormTitulo(lista.titulo)
                setFormDescripcion(lista.descripcion || '')
                setFormPublica(lista.es_publica)
              }}>
                Cancelar
              </button>
            </div>
          </form>
        )}

        {error && <p className="mensaje-error" style={{ marginBottom: '1.5rem' }}>{error}</p>}

        {lista.albumes.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
            Esta lista todavía no tiene álbumes.
          </p>
        ) : (
          <div className="album-grid" style={{ marginBottom: '2.5rem' }}>
            {lista.albumes.map((album) => (
              <div key={album.id} className="album-card" style={{ position: 'relative' }}>
                <div
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/albumes/${album.id}`)}
                >
                  <div className="album-card-cover">
                    {album.url_portada
                      ? <img src={album.url_portada} alt={album.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : album.titulo.charAt(0)
                    }
                  </div>
                  <div className="album-card-info">
                    <p className="album-card-title">{album.titulo}</p>
                    <p className="album-card-artist">{album.artista}</p>
                  </div>
                </div>
                {esPropia && (
                  <button
                    onClick={() => quitarAlbum(album.id)}
                    aria-label="Quitar de la lista"
                    title="Quitar de la lista"
                    style={{
                      position: 'absolute', top: '0.5rem', right: '0.5rem',
                      background: 'rgba(0,0,0,0.7)', color: 'var(--color-text)',
                      border: 'none', borderRadius: '4px', width: '26px', height: '26px',
                      cursor: 'pointer', fontSize: '1rem', lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {esPropia && (
          <div>
            <p className="label-mono" style={{ marginBottom: '1rem' }}>Añadir álbumes</p>
            <form onSubmit={manejarBusqueda} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <input
                className="input-field"
                placeholder="Título o artista..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button className="btn-primary" type="submit" disabled={buscando}>
                {buscando ? 'Buscando...' : 'Buscar'}
              </button>
            </form>

            <div className="resultado-busqueda-lista">
              {resultados.map((resultado) => {
                const yaAnadido = mbEnLista.has(resultado.id_musicbrainz)
                return (
                  <div key={resultado.id_musicbrainz} className="resultado-busqueda-item">
                    <div className="resultado-busqueda-cover">
                      <img
                        src={resultado.url_portada}
                        alt={resultado.titulo}
                        onError={(e) => { e.target.style.display = 'none' }}
                      />
                    </div>
                    <div className="resultado-busqueda-info">
                      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{resultado.titulo}</p>
                      <p className="label-mono">{resultado.artista} {resultado.lanzamiento ? `· ${resultado.lanzamiento}` : ''}</p>
                    </div>
                    {yaAnadido ? (
                      <span className="etiqueta-anadido">En la lista</span>
                    ) : (
                      <button
                        className="btn-primary"
                        onClick={() => anadirResultado(resultado)}
                        disabled={anadiendo === resultado.id_musicbrainz}
                        style={{ marginLeft: 'auto', flexShrink: 0, padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
                      >
                        {anadiendo === resultado.id_musicbrainz ? '...' : 'Añadir'}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
