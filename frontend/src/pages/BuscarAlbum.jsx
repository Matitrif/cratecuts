import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { buscarAlbumesExternos } from '../api/musicbrainz'
import { listarAlbumes } from '../api/albums'

export default function BuscarAlbum() {
  const [query, setQuery] = useState('')
  const [resultados, setResultados] = useState([])
  const [coleccion, setColeccion] = useState([])
  const [buscando, setBuscando] = useState(false)
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
        console.log('ID del resultado:', resultado.id_musicbrainz)
        console.log('Colección completa:', JSON.stringify(coleccion, null, 2))
        
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
            const yaAnadido = Boolean(buscarEnColeccion(resultado))
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
                {yaAnadido && <span className="etiqueta-anadido">En tu colección</span>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}