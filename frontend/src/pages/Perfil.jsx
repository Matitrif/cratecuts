import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { obtenerUsuario } from '../api/auth'
import { listarAlbumes } from '../api/albums'
import { obtenerReviewsDeUsuario } from '../api/reviews'

export default function Perfil() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [perfil, setPerfil] = useState(null)
  const [entradas, setEntradas] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    Promise.all([
      obtenerUsuario(id),
      obtenerReviewsDeUsuario(Number(id)),
      listarAlbumes(),
    ])
      .then(([resPerfil, resReviews, resAlbumes]) => {
        setPerfil(resPerfil.data)

        const mapaAlbumes = {}
        resAlbumes.data.forEach((a) => { mapaAlbumes[a.id] = a })

        const lista = resReviews.data
          .map((r) => ({ review: r, album: mapaAlbumes[r.id_album] }))
          .filter((e) => e.album && (e.review.rating != null || e.review.nota))

        setEntradas(lista)
      })
      .finally(() => setCargando(false))
  }, [id])

  if (cargando) return <p className="label-mono" style={{ padding: '3rem' }}>Cargando...</p>
  if (!perfil) return <p style={{ padding: '3rem' }}>Usuario no encontrado.</p>

  return (
    <div>
      <Navbar />
      <div className="contenido">
        <Link to="/albumes" className="volver-link">← Volver a la colección</Link>

        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.8rem', marginBottom: '0.3rem' }}>
          {perfil.nombreusuario}
        </h1>
        <p className="label-mono" style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
          {entradas.length} {entradas.length === 1 ? 'álbum reseñado' : 'álbumes reseñados'}
        </p>

        {entradas.length === 0 && (
          <p style={{ color: 'var(--color-text-muted)' }}>Todavía no has reseñado ningún álbum.</p>
        )}

        <div className="album-grid">
          {entradas.map(({ review, album }) => (
            <div
              key={album.id}
              className="album-card"
              style={{ cursor: 'pointer', position: 'relative' }}
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
              {review.rating != null && (
                <div style={{
                  position: 'absolute', bottom: '4rem', right: '0.5rem',
                  background: 'rgba(0,0,0,0.7)', borderRadius: '4px',
                  padding: '0.15rem 0.4rem', fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)', color: 'var(--color-accent)',
                }}>
                  ★ {review.rating}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
