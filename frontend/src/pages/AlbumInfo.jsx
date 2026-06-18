import { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { obtenerAlbum, crearAlbum } from '../api/albums'
import { obtenerReviewsDeAlbum } from '../api/reviews'

const ETIQUETAS_ESTADO = {
  wishlist: 'Pendiente',
  escuchando: 'Escuchando',
  completado: 'Completado',
}

export default function AlbumInfo() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const esVistaPrevia = !id && Boolean(location.state)

  const [album, setAlbum] = useState(esVistaPrevia ? location.state : null)
  const [reviews, setReviews] = useState([])
  const [cargando, setCargando] = useState(!esVistaPrevia)
  const [anadiendo, setAnadiendo] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (esVistaPrevia) return

    setCargando(true)
    Promise.all([obtenerAlbum(id), obtenerReviewsDeAlbum(Number(id))])
      .then(([resAlbum, listaReviews]) => {
        setAlbum(resAlbum.data)
        setReviews(listaReviews)
      })
      .finally(() => setCargando(false))
  }, [id])

  async function confirmarAnadir() {
    setAnadiendo(true)
    setError('')
    try {
      const res = await crearAlbum(album)
      navigate(`/albumes/${res.data.id}`, { replace: true })
    } catch {
      setError('No se pudo añadir el álbum.')
      setAnadiendo(false)
    }
  }

  if (cargando) return <p className="label-mono" style={{ padding: '3rem' }}>Cargando...</p>
  if (!album) return <p style={{ padding: '3rem' }}>Álbum no encontrado.</p>

  const conPuntuacion = reviews.filter((r) => r.rating != null)
  const promedio = conPuntuacion.length
    ? (conPuntuacion.reduce((suma, r) => suma + r.rating, 0) / conPuntuacion.length).toFixed(1)
    : null

  return (
    <div>
      <Navbar />
      <div className="contenido">
        <Link to={esVistaPrevia ? '/albumes/buscar' : '/albumes'} className="volver-link">
          ← Volver {esVistaPrevia ? 'a la búsqueda' : 'a la colección'}
        </Link>

        <div className="album-detail-header">
          <div className="album-detail-cover">
            {album.url_portada
              ? <img src={album.url_portada} alt={album.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
              : album.titulo.charAt(0)
            }
          </div>

          <div>
            <p className="label-mono">{album.genero || 'Sin género'} · {album.lanzamiento || '—'}</p>
            <h1 className="album-detail-title">{album.titulo}</h1>
            <p className="album-detail-artist">{album.artista}</p>

            {esVistaPrevia ? (
              <>
                <button className="btn-primary" onClick={confirmarAnadir} disabled={anadiendo} style={{ marginTop: '1rem' }}>
                  {anadiendo ? 'Añadiendo...' : 'Añadir a mi colección'}
                </button>
                {error && <p className="mensaje-error" style={{ marginTop: '1rem' }}>{error}</p>}
              </>
            ) : (
              promedio && (
                <p className="rating-promedio">
                  ★ {promedio} <span className="label-mono">({conPuntuacion.length} valoraciones)</span>
                </p>
              )
            )}
          </div>
        </div>

        <h2 className="label-mono" style={{ marginBottom: '0.5rem' }}>Reviews</h2>

        {reviews.length === 0 && (
          <p style={{ color: 'var(--color-text-muted)' }}>Nadie ha reseñado este álbum todavía.</p>
        )}

        {reviews.map((review) => (
          <div key={review.id} className="review-item">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {review.rating != null && <span className="review-rating">★ {review.rating}</span>}
              <span className="review-estado">{ETIQUETAS_ESTADO[review.estado] || review.estado}</span>
            </div>
            {review.nota && <p className="review-nota">{review.nota}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}