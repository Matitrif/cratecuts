import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import RutaProtegida from './components/RutaProtegida'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Inicio from './pages/Inicio'
import Albumes from './pages/Albumes'
import AlbumInfo from './pages/AlbumInfo'
import BuscarAlbum from './pages/BuscarAlbum'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route
            path="/"
            element={
              <RutaProtegida>
                <Inicio />
              </RutaProtegida>
            }
          />
          <Route
            path="/albumes"
            element={
              <RutaProtegida>
                <Albumes />
              </RutaProtegida>
            }
          />
          <Route
            path="/albumes/:id"
            element={
              <RutaProtegida>
                <AlbumInfo />
              </RutaProtegida>
            }
          />
          <Route
            path="/albumes/buscar"
            element={
              <RutaProtegida>
                <BuscarAlbum />
              </RutaProtegida>
            }
          />
          <Route
            path="/albumes/vista-previa"
            element={
              <RutaProtegida>
                <AlbumInfo />
              </RutaProtegida>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App