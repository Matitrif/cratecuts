import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { listarAlbumes } from '../api/albums'
import { obtenerMisReviews, crearReview, actualizarReview } from '../api/reviews'
import { useAuth } from '../context/AuthContext'

const COLORES_ESTADO = {
  wishlist: 'var(--color-text-muted)',
  escuchando: '#9b7fd4',
  completado: 'var(--color-accent)',
}

export default function Albumes() {
  const [albumes, setAlbumes] = useState([])
  const [misReviews, setMisReviews] = useState({})
  const [cargando, setCargando] = useState(true)
  const { usuario } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([listarAlbumes(), obtenerMisReviews()])
      .then(([resAlbumes, resMisReviews]) => {
        setAlbumes(resAlbumes.data)
        const mapa = {}
        resMisReviews.data.forEach((r) => { mapa[r.id_album] = r })
        setMisReviews(mapa)
      })
      .finally(() => setCargando(false))
  }, [])

  async function handleEliminar(e, album) {
    e.preventDefault()
    e.stopPropagation()
    const review = misReviews[album.id]
    if (!review) return
    try {
      await actualizarReview(review.id, { estado: null })
      setMisReviews((prev) => ({
        ...prev,
        [album.id]: { ...prev[album.id], estado: null },
      }))
    } catch {}
  }

  async function handleCambiarEstado(e, album) {
    e.stopPropagation()
    const nuevoEstado = e.target.value
    if (!nuevoEstado) return

    const reviewExistente = misReviews[album.id]
    try {
      let reviewActualizada
      if (reviewExistente) {
        const res = await actualizarReview(reviewExistente.id, { estado: nuevoEstado })
        reviewActualizada = res.data
      } else {
        const res = await crearReview({ id_album: album.id, estado: nuevoEstado })
        reviewActualizada = res.data
      }
      setMisReviews((prev) => ({ ...prev, [album.id]: reviewActualizada }))
    } catch {}
  }

  return (
    <div>
      <Navbar />
      <div className="contenido">
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.8rem' }}>
          Colección
        </h1>

        {cargando && <p className="label-mono" style={{ marginTop: '1.5rem' }}>Cargando...</p>}

        {!cargando && !albumes.some((a) => misReviews[a.id]?.estado) && (
          <p style={{ marginTop: '1.5rem', color: 'var(--color-text-muted)' }}>
            Tu colección está vacía. Busca álbumes para añadir.
          </p>
        )}

        <div className="album-grid">
          {albumes.filter((a) => misReviews[a.id]?.estado).map((album) => {
            const miReview = misReviews[album.id]
            return (
              <div key={album.id} className="album-card" style={{ position: 'relative', cursor: 'pointer' }}>
                <div onClick={() => navigate(`/albumes/${album.id}`)}>
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

                <div style={{ padding: '0 0.6rem 0.6rem' }}>
                  <select
                    value={miReview?.estado || ''}
                    onChange={(e) => handleCambiarEstado(e, album)}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      width: '100%', background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                      borderRadius: '4px', padding: '0.25rem 0.4rem', fontSize: '0.72rem',
                      fontFamily: 'var(--font-mono)', cursor: 'pointer',
                      color: miReview ? COLORES_ESTADO[miReview.estado] : 'var(--color-text-muted)',
                    }}
                  >
                    <option value="" disabled>— estado —</option>
                    <option value="wishlist">Pendiente</option>
                    <option value="escuchando">Escuchando</option>
                    <option value="completado">Completado</option>
                  </select>
                </div>

                {usuario && (
                  <button
                    onClick={(e) => handleEliminar(e, album)}
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
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
