# Cratecuts — Contexto del proyecto

Backlogger de música inspirado en Letterboxd. Permite a los usuarios buscar álbumes reales (vía MusicBrainz), añadirlos a una colección compartida, y dejar su propia puntuación/nota/estado sobre cada álbum, viendo también las reseñas del resto de usuarios.

## Stack

- **Frontend**: React + Vite, CSS plano (sin Tailwind), `react-router-dom`, `axios`
- **Backend**: FastAPI (Python), SQLAlchemy (ORM), PostgreSQL, autenticación JWT (`python-jose` + `passlib[bcrypt]`)
- **Infra**: Docker Compose (servicios `db`, `backend`, `frontend`), repo en GitHub (`Matitrif/cratecuts`, rama `main`)

## Convención de nombres (importante)

- Variables, funciones y nombres de dominio en **castellano** (`usuario`, `album`, `nota`, `estado`, `crear_album`, etc.)
- Términos técnicos estándar de la industria se mantienen en **inglés**: nombres de carpetas/archivos (`database.py`, `models/`, `schemas/`, `routers/`), y la clase `Review`/tabla `reviews` (se decidió mantener "review" en vez de "reseña" en el código, aunque la UI sí dice "reseña")
- `security.py` se renombró a `seguridad.py`

## Estructura del backend

```
backend/
  main.py            # arranque FastAPI, incluye todos los routers
  database.py        # engine SQLAlchemy + get_db()
  seguridad.py        # hash de contraseñas (bcrypt) + JWT (crear/decodificar token)
  dependencies.py     # obtener_usuario_actual() — exige token válido; requerir_admin() — además exige es_admin=True (403 si no)
  models/
    user.py            # class User -> tabla "users": id, nombreusuario, email, password_hash, es_admin, creado_en
    album.py           # class Album -> tabla "albums": id, titulo, artista, genero, lanzamiento, url_portada, id_musicbrainz
    review.py          # class Review -> tabla "reviews": id, id_usuario(FK), id_album(FK), rating, nota, estado(enum), creado_en, actualizado_en
  schemas/
    user.py, album.py, review.py, auth.py   # esquemas Pydantic (Crear/Actualizar/Salida por entidad)
  routers/
    auth.py            # POST /auth/login (OAuth2PasswordRequestForm -> {access_token, token_type})
    users.py            # POST /usuarios/ (registro), GET /usuarios/{id}
    albums.py            # CRUD completo /albumes/ — POST protegido con JWT (cualquier usuario), PUT/DELETE solo admin (requerir_admin)
    reviews.py           # GET público; POST/PUT/DELETE protegidos con JWT, solo el dueño edita/borra su review
    musicbrainz.py        # GET /musicbrainz/buscar?q=... — proxy a la API de MusicBrainz + portadas de Cover Art Archive
```

### Enum de estado de review
`StatusEnum`: `wishlist` (pendiente), `escuchando`, `completado`

## Frontend

```
frontend/src/
  api/
    index.js       # instancia axios, interceptor que añade Authorization Bearer desde localStorage
    auth.js, albums.js, reviews.js, musicbrainz.js
  context/
    AuthContext.jsx  # token JWT en localStorage, decodifica payload, expone {usuario, cargando, login, registrar, logout}
  components/
    Navbar.jsx        # logo + enlace Colección + icono lupa (búsqueda) + nombre usuario + logout
    RutaProtegida.jsx  # redirige a /login si no hay sesión
  pages/
    Login.jsx, Registro.jsx, Inicio.jsx
    Albumes.jsx        # grid de la colección (/albumes)
    AlbumInfo.jsx       # detalle de álbum (/albumes/:id) Y vista previa (/albumes/vista-previa, alimentada por location.state)
                          # incluye: portada, género/año, rating promedio "X/5" o "-/5", formulario para
                          # crear/editar/borrar TU review (estrellas 1-5, select de estado, textarea de nota),
                          # y debajo las reviews de los demás usuarios (solo lectura)
    BuscarAlbum.jsx      # busca en MusicBrainz, detecta si cada resultado ya está en la colección
                          # (por id_musicbrainz, con fallback a comparar titulo+artista en minúsculas)
                          # y muestra etiqueta "En tu colección" o lleva a la vista previa si no está
```

## Diseño visual

- Fondo casi negro `#100e0c` con textura de grano (SVG `feTurbulence` en `body::before`, `background-size: 182px`, `opacity: 0.12`)
- Tipografías: **Cabinet Grotesk** (logo/títulos, `var(--font-display)`), **Space Grotesk** (etiquetas mono, `var(--font-mono)`), **Inter** (cuerpo, `var(--font-body)`) — cargadas vía Fontshare y Google Fonts en el `@import` de `index.css`
- Acento color naranja estilo "Channel Orange" de Frank Ocean: `--color-accent: #f2691c`, `--color-accent-dim: #6b3210`
- Sin emojis en ningún texto de la UI
- Todo el sistema de color/tipografía está en variables CSS en `:root` (`frontend/src/index.css`), así que cambiar un acento es cambiar 1-2 líneas

## Pendiente / posibles próximos pasos

1. ~~**Proteger álbumes**~~: `PUT`/`DELETE /albumes/{id}` ya están restringidos a `es_admin=True` — `requerir_admin` en `dependencies.py`
2. **Perfil de usuario** con su propio backlog (álbumes filtrados por estado: pendiente/escuchando/completado)
3. **Migraciones con Alembic**: ahora mismo, si se cambia un modelo SQLAlchemy hay que hacer `docker-compose down -v` (borra todos los datos) porque `Base.metadata.create_all()` no migra columnas existentes
4. Hay un álbum de prueba ("OK Computer") creado manualmente sin `id_musicbrainz`, lo que rompe la detección automática al buscarlo — se puede arreglar con un `PUT` manual o borrándolo y re-añadiéndolo desde el buscador
5. El warning de `bcrypt` en los logs del backend es cosmético, no bloquea nada

## Detalles operativos para Docker

- `docker-compose.yaml` tiene un `healthcheck` en `db` (`pg_isready`) y `depends_on: condition: service_healthy` en `backend`, para evitar errores de "Connection refused" al arrancar todo de cero
- Variables en `.env` (no se sube a git): `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `SECRET_KEY`
- `docker-compose up --build` solo es necesario si cambia `requirements.txt` o `package.json`; para cambios de código basta `docker-compose up` (hot reload activo: `--reload` en backend, Vite en frontend)
- Si se cambia el esquema de un modelo, hay que `docker-compose down -v` antes de volver a levantar
