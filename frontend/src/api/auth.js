import api from './index'

export function registrarUsuario({ nombreusuario, email, password }) {
  return api.post('/usuarios/', { nombreusuario, email, password })
}

export function iniciarSesion(nombreusuario, password) {
  const datosFormulario = new URLSearchParams()
  datosFormulario.append('username', nombreusuario)
  datosFormulario.append('password', password)

  return api.post('/auth/login', datosFormulario, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

export function obtenerUsuario(idUsuario) {
  return api.get(`/usuarios/${idUsuario}`)
}