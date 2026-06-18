import api from './index'

export function listarReviews() {
  return api.get('/reviews/')
}

// El backend no filtra por álbum todavía, así que filtramos en el cliente
export async function obtenerReviewsDeAlbum(idAlbum) {
  const res = await listarReviews()
  return res.data.filter((review) => review.id_album === idAlbum)
}