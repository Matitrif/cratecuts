import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { obtenerUsuario, actualizarPerfil, subirFotoPerfil } from '../api/auth'
import { listarAlbumes } from '../api/albums'
import { obtenerReviewsDeUsuario } from '../api/reviews'
import { useAuth } from '../context/AuthContext'

export default function Perfil() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { usuario, setUsuario } = useAuth()

  const [perfil, setPerfil] = useState(null)
  const [entradas, setEntradas] = useState([])
  const [cargando, setCargando] = useState(true)

  const [editando, setEditando] = useState(false)
  const [formBio, setFormBio] = useState('')
  const [fotoPrevia, setFotoPrevia] = useState(null)
  const [archivoFoto, setArchivoFoto] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [errorForm, setErrorForm] = useState('')
  const inputFoto = useRef(null)

  const esPropioPeril = usuario?.id === Number(id)

  useEffect(() => {
    Promise.all([
      obtenerUsuario(id),
      obtenerReviewsDeUsuario(Number(id)),
      listarAlbumes(),
    ])
      .then(([resPerfil, resReviews, resAlbumes]) => {
        setPerfil(resPerfil.data)
        setFormBio(resPerfil.data.biografia || '')

        const mapaAlbumes = {}
        resAlbumes.data.forEach((a) => { mapaAlbumes[a.id] = a })

        const lista = resReviews.data
          .map((r) => ({ review: r, album: mapaAlbumes[r.id_album] }))
          .filter((e) => e.album && (e.review.rating != null || e.review.nota))

        setEntradas(lista)
      })
      .finally(() => setCargando(false))
  }, [id])

  function handleSeleccionFoto(e) {
    const archivo = e.target.files[0]
    if (!archivo) return
    setArchivoFoto(archivo)
    setFotoPrevia(URL.createObjectURL(archivo))
  }

  async function guardarPerfil(e) {
    e.preventDefault()
    setGuardando(true)
    setErrorForm('')
    try {
      let perfilActualizado = perfil

      if (archivoFoto) {
        const res = await subirFotoPerfil(archivoFoto)
        perfilActualizado = res.data
      }

      const res = await actualizarPerfil({ biografia: formBio || null })
      perfilActualizado = res.data

      setPerfil(perfilActualizado)
      if (setUsuario) setUsuario(perfilActualizado)
      setEditando(false)
      setArchivoFoto(null)
      setFotoPrevia(null)
    } catch {
      setErrorForm('No se pudo guardar el perfil.')
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) return <p className="label-mono" style={{ padding: '3rem' }}>Cargando...</p>
  if (!perfil) return <p style={{ padding: '3rem' }}>Usuario no encontrado.</p>

  const fotoMostrada = fotoPrevia || perfil.foto_perfil

  return (
    <div>
      <Navbar />
      <div className="contenido">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', marginBottom: '2rem' }}>
          <div
            style={{
              width: '80px', height: '80px', borderRadius: '50%', flexShrink: 0,
              background: 'var(--color-surface)', border: '2px solid var(--color-border)',
              overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', fontFamily: 'var(--font-display)', cursor: editando ? 'pointer' : 'default',
            }}
            onClick={() => editando && inputFoto.current?.click()}
          >
            {fotoMostrada
              ? <img src={fotoMostrada} alt="foto de perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : perfil.nombreusuario.charAt(0).toUpperCase()
            }
          </div>

          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.8rem', marginBottom: '0.2rem' }}>
              {perfil.nombreusuario}
            </h1>
            <p className="label-mono" style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
              {entradas.length} {entradas.length === 1 ? 'álbum reseñado' : 'álbumes reseñados'}
            </p>
            {!editando && perfil.biografia && (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{perfil.biografia}</p>
            )}
            {esPropioPeril && !editando && (
              <button
                className="btn-link"
                style={{ marginTop: '0.5rem' }}
                onClick={() => setEditando(true)}
              >
                Editar perfil
              </button>
            )}
          </div>
        </div>

        {editando && (
          <form onSubmit={guardarPerfil} style={{ marginBottom: '2rem', maxWidth: '500px' }}>
            <input
              ref={inputFoto}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={handleSeleccionFoto}
            />

            <div className="campo-form">
              <label className="label-mono">Foto de perfil</label>
              <button type="button" className="btn-link" onClick={() => inputFoto.current?.click()}>
                {archivoFoto ? archivoFoto.name : 'Seleccionar imagen'}
              </button>
              <p className="label-mono" style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                JPEG, PNG o WebP · máx. 2 MB
              </p>
            </div>

            <div className="campo-form">
              <label className="label-mono">Biografía</label>
              <textarea
                className="textarea-field"
                value={formBio}
                onChange={(e) => setFormBio(e.target.value)}
                placeholder="Cuéntanos algo sobre ti..."
                rows={3}
              />
            </div>

            {errorForm && <p className="mensaje-error" style={{ marginBottom: '1rem' }}>{errorForm}</p>}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-primary" type="submit" disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
              <button type="button" className="btn-link" onClick={() => {
                setEditando(false)
                setArchivoFoto(null)
                setFotoPrevia(null)
                setFormBio(perfil.biografia || '')
              }}>
                Cancelar
              </button>
            </div>
          </form>
        )}

        <h2 className="titulo-seccion" style={{ marginTop: '1rem' }}>Álbumes reseñados</h2>

        {entradas.length === 0 && (
          <p style={{ color: 'var(--color-text-muted)' }}>
            {esPropioPeril ? 'Todavía no has reseñado ningún álbum.' : 'Este usuario todavía no ha reseñado ningún álbum.'}
          </p>
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
