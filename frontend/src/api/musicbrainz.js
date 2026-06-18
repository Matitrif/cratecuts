import api from './index'

export function buscarAlbumesExternos(query) {
  return api.get('/musicbrainz/buscar', { params: { q: query } })
}