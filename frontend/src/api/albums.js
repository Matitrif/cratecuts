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