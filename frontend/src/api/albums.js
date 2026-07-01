import api from './index'

export function listarAlbumes() {
  return api.get('/albumes/')
}

export function obtenerAlbum(idAlbum) {
  return api.get(`/albumes/${idAlbum}`)
}

export function crearAlbum(datos) {
  return api.post('/albumes/', datos)
}

export function obtenerAlbumPorMB(idMusicbrainz) {
  return api.get(`/albumes/por-mb/${idMusicbrainz}`)
}

export function obtenerAlbumesDestacados() {
  return api.get('/albumes/destacados')
}

export function obtenerEstadisticas() {
  return api.get('/estadisticas')
}