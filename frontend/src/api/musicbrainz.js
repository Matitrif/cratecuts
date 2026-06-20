import api from './index'

export function buscarAlbumesExternos(query) {
  return api.get('/musicbrainz/buscar', { params: { q: query } })
}

export function obtenerCanciones(idMusicbrainz) {
  return api.get(`/musicbrainz/canciones/${idMusicbrainz}`)
}