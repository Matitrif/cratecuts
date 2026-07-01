import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { obtenerAlbumesDestacados, obtenerEstadisticas } from '../api/albums'
import { listasRecientes } from '../api/listas'

export default function Inicio() {
  const { usuario } = useAuth()
  const [stats, setStats] = useState(null)
  const [destacados, setDestacados] = useState([])
  const [listas, setListas] = useState([])

  useEffect(() => {
    obtenerEstadisticas().then((res) => setStats(res.data)).catch(() => {})
    obtenerAlbumesDestacados().then((res) => setDestacados(res.data)).catch(() => {})
    listasRecientes().then((res) => setListas(res.data)).catch(() => {})
  }, [])

  return (
    <div>
      <Navbar />
      <div className="contenido">
        <p className="label-mono" style={{ marginBottom: '0.3rem' }}>Bienvenido</p>
        <p style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '2.5rem' }}>
          {usuario?.nombreusuario}
        </p>

        {listas.length > 0 && (
          <div style={{ marginBottom: '3rem' }}>
            <h2 className="titulo-seccion">Listas recientes de la comunidad</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.2rem' }}>
              {listas.map((lista) => (
                <Link
                  key={lista.id}
                  to={`/listas/${lista.id}`}
                  style={{
                    textDecoration: 'none', color: 'inherit',
                    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                    borderRadius: '8px', overflow: 'hidden', display: 'block',
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', aspectRatio: '1' }}>
                    {Array.from({ length: 4 }).map((_, i) => {
                      const album = lista.albumes[i]
                      return (
                        <div
                          key={i}
                          style={{
                            background: 'linear-gradient(135deg, var(--color-surface-hover), var(--color-bg))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                          }}
                        >
                          {album && album.url_portada
                            ? <img src={album.url_portada} alt={album.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : album
                              ? <span style={{ fontFamily: 'var(--font-display)', color: 'var(--color-accent-dim)' }}>{album.titulo.charAt(0)}</span>
                              : null
                          }
                        </div>
                      )
                    })}
                  </div>
                  <div style={{ padding: '0.8rem', display: 'flex', alignItems: 'baseline', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <p className="album-card-title" style={{ marginBottom: 0 }}>{lista.titulo}</p>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{lista.nombre_usuario}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {stats && (
          <div style={{ marginBottom: '3rem' }}>
            <h2 className="titulo-seccion">Estadísticas de Cratecuts</h2>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={estiloStat}>
                <span className="label-mono">Albums</span>
                <span style={estiloNumero}>{stats.total_albumes}</span>
              </div>
              <div style={estiloStat}>
                <span className="label-mono">Reseñas</span>
                <span style={estiloNumero}>{stats.total_reviews}</span>
              </div>
              <div style={estiloStat}>
                <span className="label-mono">Usuarios</span>
                <span style={estiloNumero}>{stats.total_usuarios}</span>
              </div>
            </div>
          </div>
        )}

        {destacados.length > 0 && (
          <>
            <h2 className="titulo-seccion">Mejor valorados</h2>
            <div className="album-grid">
              {destacados.map((album) => (
                <Link key={album.id} to={`/albumes/${album.id}`} className="album-card">
                  <div className="album-card-cover">
                    {album.url_portada
                      ? <img src={album.url_portada} alt={album.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : '♪'
                    }
                  </div>
                  <div className="album-card-info">
                    <div className="album-card-title">{album.titulo}</div>
                    <div className="album-card-artist">{album.artista}</div>
                    <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                        {album.promedio.toFixed(1)} / 5
                      </span>
                      <span className="label-mono" style={{ fontSize: '0.65rem' }}>
                        {album.num_reviews} {album.num_reviews === 1 ? 'reseña' : 'reseñas'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const estiloStat = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
  padding: '1.2rem 2rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.4rem',
  minWidth: '120px',
}

const estiloNumero = {
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  fontSize: '2.2rem',
  color: 'var(--color-accent)',
}
