import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { listarAlbumes } from '../api/albums'

export default function Albumes() {
  const [albumes, setAlbumes] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    listarAlbumes()
      .then((res) => setAlbumes(res.data))
      .finally(() => setCargando(false))
  }, [])

  return (
    <div>
      <Navbar />
      <div className="contenido">
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.8rem' }}>
            Colección
        </h1>

        {cargando && <p className="label-mono" style={{ marginTop: '1.5rem' }}>Cargando...</p>}

        {!cargando && albumes.length === 0 && (
          <p style={{ marginTop: '1.5rem', color: 'var(--color-text-muted)' }}>
            Todavía no hay álbumes registrados.
          </p>
        )}

        <div className="album-grid">
          {albumes.map((album) => (
            <Link key={album.id} to={`/albumes/${album.id}`} className="album-card">
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
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}