import { createContext, useContext, useState, useEffect } from 'react'
import { iniciarSesion, registrarUsuario, obtenerUsuario } from '../api/auth'

const AuthContext = createContext(null)

function decodificarToken(token) {
  try {
    const payload = token.split('.')[1]
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('cratecuts_token')
    if (!token) {
      setCargando(false)
      return
    }

    const payload = decodificarToken(token)
    const expirado = !payload || payload.exp * 1000 < Date.now()

    if (expirado) {
      localStorage.removeItem('cratecuts_token')
      setCargando(false)
      return
    }

    obtenerUsuario(payload.sub)
      .then((res) => setUsuario(res.data))
      .catch(() => localStorage.removeItem('cratecuts_token'))
      .finally(() => setCargando(false))
  }, [])

  async function login(nombreusuario, password) {
    const res = await iniciarSesion(nombreusuario, password)
    localStorage.setItem('cratecuts_token', res.data.access_token)

    const payload = decodificarToken(res.data.access_token)
    const datosUsuario = await obtenerUsuario(payload.sub)
    setUsuario(datosUsuario.data)
  }

  async function registrar(datos) {
    await registrarUsuario(datos)
    await login(datos.nombreusuario, datos.password)
  }

  function logout() {
    localStorage.removeItem('cratecuts_token')
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, registrar, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}