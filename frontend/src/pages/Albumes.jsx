import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { listarAlbumes, eliminarAlbum } from '../api/albums'
import { useAuth } from '../context/AuthContext'

export default function Albumes() {
  const [albumes, setAlbumes] = useState([])
  const [cargando, setCargando] = useState(true)
  const { usuario } = useAuth()

  useEffect(() => {
    cargarAlbumes()
  }, [])

  function cargarAlbumes() {
    listarAlbumes()
      .then((res) => setAlbumes(res.data))
      .finally(() => setCargando(false))
  }

  async function handleEliminar(e, idAlbum) {
    e.preventDefault()
    try {
      await eliminarAlbum(idAlbum)
      setAlbumes((prev) => prev.filter((a) => a.id !== idAlbum))
    } catch {
      // el interceptor de axios mostrará el 403 si no es admin
    }
  }

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
            <Link key={album.id} to={`/albumes/${album.id}`} className="album-card" style={{ position: 'relative' }}>
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
              {usuario?.es_admin && (
                <button
                  onClick={(e) => handleEliminar(e, album.id)}
                  style={{
                    position: 'absolute', top: '0.5rem', right: '0.5rem',
                    background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%',
                    color: 'var(--color-text-muted)', width: '1.6rem', height: '1.6rem',
                    cursor: 'pointer', fontSize: '1rem', lineHeight: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  ×
                </button>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
