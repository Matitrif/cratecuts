import api from './index'

export function listarReviews() {
  return api.get('/reviews/')
}

export async function obtenerReviewsDeAlbum(idAlbum) {
  const res = await listarReviews()
  return res.data.filter((review) => review.id_album === idAlbum)
}

export function crearReview(datos) {
  return api.post('/reviews/', datos)
}

export function actualizarReview(idReview, datos) {
  return api.put(`/reviews/${idReview}`, datos)
}

export function eliminarReview(idReview) {
  return api.delete(`/reviews/${idReview}`)
}

export function obtenerMiReview(idAlbum) {
  return api.get('/reviews/mia', { params: { id_album: idAlbum } })
}