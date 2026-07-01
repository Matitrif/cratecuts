import api from './index'

export function listarListas(idUsuario) {
  return api.get('/listas/', { params: idUsuario != null ? { id_usuario: idUsuario } : {} })
}

export function obtenerLista(idLista) {
  return api.get(`/listas/${idLista}`)
}

export function listasRecientes() {
  return api.get('/listas/recientes')
}

export function crearLista(datos) {
  return api.post('/listas/', datos)
}

export function actualizarLista(idLista, datos) {
  return api.put(`/listas/${idLista}`, datos)
}

export function eliminarLista(idLista) {
  return api.delete(`/listas/${idLista}`)
}

export function anadirAlbumALista(idLista, idAlbum) {
  return api.post(`/listas/${idLista}/albumes`, { id_album: idAlbum })
}

export function quitarAlbumDeLista(idLista, idAlbum) {
  return api.delete(`/listas/${idLista}/albumes/${idAlbum}`)
}
