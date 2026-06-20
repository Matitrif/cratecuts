import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { buscarAlbumesExternos } from '../api/musicbrainz'
import { listarAlbumes, crearAlbum } from '../api/albums'

export default function BuscarAlbum() {
  const [query, setQuery] = useState('')
  const [resultados, setResultados] = useState([])
  const [coleccion, setColeccion] = useState([])
  const [buscando, setBuscando] = useState(false)
  const [anadiendo, setAnadiendo] = useState(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    listarAlbumes().then((res) => setColeccion(res.data))
  }, [])

  async function manejarBusqueda(e) {
    e.preventDefault()
    if (!query.trim()) return

    setBuscando(true)
    setError('')
    try {
      const res = await buscarAlbumesExternos(query)
      setResultados(res.data)
    } catch {
      setError('No se pudo conectar con MusicBrainz. Inténtalo de nuevo.')
    } finally {
      setBuscando(false)
    }
  }

  function buscarEnColeccion(resultado) {
    const porId = coleccion.find(
      (album) => album.id_musicbrainz && album.id_musicbrainz === resultado.id_musicbrainz
    )
    if (porId) return porId

    return coleccion.find(
      (album) =>
        album.titulo.toLowerCase().trim() === resultado.titulo.toLowerCase().trim() &&
        album.artista.toLowerCase().trim() === resultado.artista.toLowerCase().trim()
    )
  }

  async function handleAnadir(e, resultado) {
    e.stopPropagation()
    setAnadiendo(resultado.id_musicbrainz)
    try {
      const res = await crearAlbum(resultado)
      setColeccion((prev) => [...prev, res.data])
      navigate(`/albumes/${res.data.id}`)
    } catch {
      setError('No se pudo añadir el álbum.')
      setAnadiendo(null)
    }
  }

  function abrirResultado(resultado) {
    const existente = buscarEnColeccion(resultado)
    if (existente) {
      navigate(`/albumes/${existente.id}`)
    } else {
      navigate('/albumes/vista-previa', { state: resultado })
    }
  }

  return (
    <div>
      <Navbar />
      <div className="contenido">
        <Link to="/albumes" className="volver-link">← Volver a la colección</Link>

        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.8rem', marginBottom: '1.5rem' }}>
          Buscar álbumes
        </h1>

        <form onSubmit={manejarBusqueda} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
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

        {error && <p className="mensaje-error" style={{ marginBottom: '1.5rem' }}>{error}</p>}

        <div className="resultado-busqueda-lista">
          {resultados.map((resultado) => {
            const existente = buscarEnColeccion(resultado)
            return (
              <div
                key={resultado.id_musicbrainz}
                className="resultado-busqueda-item"
                onClick={() => abrirResultado(resultado)}
                style={{ cursor: 'pointer' }}
              >
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
                {existente ? (
                  <span className="etiqueta-anadido">En tu colección</span>
                ) : (
                  <button
                    className="btn-primary"
                    onClick={(e) => handleAnadir(e, resultado)}
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
    </div>
  )
}
