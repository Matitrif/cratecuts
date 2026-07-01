import { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { obtenerAlbum, crearAlbum, obtenerAlbumPorMB } from '../api/albums'
import { obtenerReviewsDeAlbum, crearReview, actualizarReview, obtenerMiReview } from '../api/reviews'
import { obtenerCanciones } from '../api/musicbrainz'
import { useAuth } from '../context/AuthContext'

function formatearDuracion(ms) {
  if (!ms) return '—'
  const total = Math.round(ms / 1000)
  const min = Math.floor(total / 60)
  const seg = total % 60
  return `${min}:${seg.toString().padStart(2, '0')}`
}

export default function AlbumInfo() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { usuario } = useAuth()

  const esVistaPrevia = !id && Boolean(location.state)

  const [album, setAlbum] = useState(esVistaPrevia ? location.state : null)
  const [reviews, setReviews] = useState([])
  const [miReview, setMiReview] = useState(null)
  const [canciones, setCanciones] = useState([])
  const [cargando, setCargando] = useState(!esVistaPrevia)
  const [anadiendo, setAnadiendo] = useState(false)
  const [error, setError] = useState('')
  const [editando, setEditando] = useState(false)

  const [formRating, setFormRating] = useState(0)
  const [formNota, setFormNota] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [errorForm, setErrorForm] = useState('')

  useEffect(() => {
    if (!esVistaPrevia) {
      cargarDatos()
      return
    }

    const mbId = location.state?.id_musicbrainz
    if (!mbId) return

    obtenerCanciones(mbId)
      .then((res) => setCanciones(res.data))
      .catch(() => {})

    obtenerAlbumPorMB(mbId)
      .then((res) => {
        const albumDb = res.data
        setAlbum(albumDb)
        return Promise.all([
          obtenerReviewsDeAlbum(albumDb.id),
          obtenerMiReview(albumDb.id),
        ])
      })
      .then(([listaReviews, resMiReview]) => {
        setReviews(listaReviews)
        const propia = resMiReview.data
        setMiReview(propia || null)
        if (propia) {
          setFormRating(propia.rating || 0)
          setFormNota(propia.nota || '')
        }
      })
      .catch(() => {})
  }, [])

  function cargarDatos() {
    setCargando(true)
    Promise.all([
      obtenerAlbum(id),
      obtenerReviewsDeAlbum(Number(id)),
      obtenerMiReview(Number(id)),
    ])
      .then(([resAlbum, listaReviews, resMiReview]) => {
        const albumData = resAlbum.data
        setAlbum(albumData)
        setReviews(listaReviews)

        const propia = resMiReview.data
        setMiReview(propia || null)
        if (propia) {
          setFormRating(propia.rating || 0)
          setFormNota(propia.nota || '')
        }

        if (albumData.id_musicbrainz) {
          obtenerCanciones(albumData.id_musicbrainz)
            .then((res) => setCanciones(res.data))
            .catch(() => {})
        }
      })
      .finally(() => setCargando(false))
  }

  async function confirmarAnadir() {
    setAnadiendo(true)
    setError('')
    try {
      let idAlbum = album?.id
      if (!idAlbum) {
        const res = await crearAlbum(album)
        idAlbum = res.data.id
      }
      if (!miReview) {
        await crearReview({ id_album: idAlbum, estado: 'completado' })
      } else if (!miReview.estado) {
        await actualizarReview(miReview.id, { estado: 'completado' })
      }
      if (esVistaPrevia) {
        navigate(`/albumes/${idAlbum}`, { replace: true })
      } else {
        cargarDatos()
        setAnadiendo(false)
      }
    } catch {
      setError('No se pudo añadir el álbum.')
      setAnadiendo(false)
    }
  }

  const otrasReviews = reviews.filter((r) => r.id_usuario !== usuario.id)

  async function guardarMiReview(e) {
    e.preventDefault()
    setGuardando(true)
    setErrorForm('')

    const datos = {
      rating: formRating > 0 ? formRating : null,
      nota: formNota || null,
    }

    try {
      let idAlbum = album?.id

      if (!idAlbum) {
        const resAlbum = await crearAlbum(album)
        idAlbum = resAlbum.data?.id
        if (!idAlbum) throw new Error('no_id')
        setAlbum(resAlbum.data)
      }

      let reviewGuardada
      if (miReview) {
        const res = await actualizarReview(miReview.id, datos)
        reviewGuardada = res.data
      } else {
        const res = await crearReview({ id_album: idAlbum, ...datos })
        reviewGuardada = res.data
      }

      if (esVistaPrevia) {
        navigate(`/albumes/${idAlbum}`, { replace: true })
        return
      }

      setMiReview(reviewGuardada)
      setFormRating(reviewGuardada.rating || 0)
      setFormNota(reviewGuardada.nota || '')
      setEditando(false)
      obtenerReviewsDeAlbum(Number(id)).then(setReviews)
    } catch (err) {
      const detalle = err?.response?.data?.detail
      setErrorForm(
        Array.isArray(detalle)
          ? detalle.map((d) => d.msg).join(', ')
          : 'No se pudo guardar la reseña.'
      )
    } finally {
      setGuardando(false)
    }
  }

  async function borrarMiReview() {
    if (!miReview) return
    setGuardando(true)
    try {
      const res = await actualizarReview(miReview.id, { rating: null, nota: null })
      setMiReview(res.data)
      setFormRating(0)
      setFormNota('')
      setEditando(false)
      if (!esVistaPrevia) obtenerReviewsDeAlbum(Number(id)).then(setReviews)
    } catch {
      setErrorForm('No se pudo eliminar la reseña.')
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) return <p className="label-mono" style={{ padding: '3rem' }}>Cargando...</p>
  if (!album) return <p style={{ padding: '3rem' }}>Álbum no encontrado.</p>

  const conPuntuacion = reviews.filter((r) => r.rating != null)
  const promedio = conPuntuacion.length
    ? (conPuntuacion.reduce((suma, r) => suma + r.rating, 0) / conPuntuacion.length).toFixed(1)
    : null

  const albumEnDb = Boolean(album?.id)

  return (
    <div>
      <Navbar />
      <div className="contenido">
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

            <p className="rating-promedio">
              ★ {promedio ? `${promedio}/5` : '-/5'}
              {conPuntuacion.length > 0 && (
                <span className="label-mono"> ({conPuntuacion.length} valoraciones)</span>
              )}
            </p>

            {!miReview?.estado && (
              <div style={{ marginTop: '1rem' }}>
                <button className="btn-primary" onClick={confirmarAnadir} disabled={anadiendo}>
                  {anadiendo ? 'Añadiendo...' : 'Añadir a mi colección'}
                </button>
                {error && <p className="mensaje-error" style={{ marginTop: '0.5rem' }}>{error}</p>}
              </div>
            )}
          </div>
        </div>

        {canciones.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h2 className="label-mono" style={{ marginBottom: '0.6rem' }}>Canciones</h2>
            <div style={{ borderTop: '1px solid var(--color-border)' }}>
              {canciones.map((cancion) => (
                <div
                  key={cancion.posicion}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.55rem 0', borderBottom: '1px solid var(--color-border)',
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.9rem', alignItems: 'baseline' }}>
                    <span className="label-mono" style={{ color: 'var(--color-text-muted)', minWidth: '1.5rem', textAlign: 'right' }}>
                      {cancion.posicion}
                    </span>
                    <span>{cancion.titulo}</span>
                  </div>
                  <span className="label-mono" style={{ color: 'var(--color-text-muted)' }}>
                    {formatearDuracion(cancion.duracion_ms)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {(
          <>
            <h2 className="label-mono" style={{ marginBottom: '0.8rem', marginTop: '2rem' }}>Tu reseña</h2>

            {miReview && (miReview.rating != null || miReview.nota) && !editando ? (
              <div className="mi-review-card">
                {miReview.rating != null && (
                  <div className="selector-estrellas" style={{ pointerEvents: 'none', marginBottom: '0.5rem' }}>
                    {[1, 2, 3, 4, 5].map((v) => (
                      <span key={v} className={`estrella-boton ${v <= miReview.rating ? 'activa' : ''}`}>★</span>
                    ))}
                  </div>
                )}
                {miReview.nota && <p className="review-nota" style={{ marginTop: '0.3rem' }}>{miReview.nota}</p>}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.8rem' }}>
                  <button type="button" className="btn-link" onClick={() => setEditando(true)}>Editar</button>
                  <button type="button" className="btn-link" onClick={borrarMiReview} disabled={guardando}>Eliminar</button>
                </div>
              </div>
            ) : (
              <form onSubmit={guardarMiReview} className="mi-review-card">
                <div className="campo-form">
                  <label className="label-mono">Puntuación</label>
                  <div className="selector-estrellas">
                    {[1, 2, 3, 4, 5].map((valor) => (
                      <button
                        key={valor}
                        type="button"
                        className={`estrella-boton ${valor <= formRating ? 'activa' : ''}`}
                        onClick={() => setFormRating(valor === formRating ? 0 : valor)}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div className="campo-form">
                  <label className="label-mono">Nota</label>
                  <textarea
                    className="textarea-field"
                    value={formNota}
                    onChange={(e) => setFormNota(e.target.value)}
                    placeholder="¿Qué te ha parecido?"
                  />
                </div>

                {errorForm && <p className="mensaje-error" style={{ marginBottom: '1rem' }}>{errorForm}</p>}

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn-primary" type="submit" disabled={guardando}>
                    {guardando ? 'Guardando...' : miReview ? 'Actualizar reseña' : 'Guardar reseña'}
                  </button>
                  {editando && (
                    <button type="button" className="btn-link" onClick={() => setEditando(false)} disabled={guardando}>
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            )}

            <h2 className="label-mono" style={{ marginBottom: '0.5rem', marginTop: '2rem' }}>Reviews de otros usuarios</h2>

            {otrasReviews.length === 0 && (
              <p style={{ color: 'var(--color-text-muted)' }}>Nadie más ha reseñado este álbum todavía.</p>
            )}

            {otrasReviews.map((review) => (
              <div key={review.id} className="review-item">
                {review.rating != null && <span className="review-rating">★ {review.rating}</span>}
                {review.nota && <p className="review-nota">{review.nota}</p>}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
