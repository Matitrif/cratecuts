from fastapi import APIRouter, Query
import requests

router = APIRouter()

MUSICBRAINZ_URL = "https://musicbrainz.org/ws/2/release-group"
MUSICBRAINZ_RELEASE_URL = "https://musicbrainz.org/ws/2/release"
USER_AGENT = "Cratecuts/1.0 (proyecto educativo)"

@router.get("/buscar")
def buscar_albumes(q: str = Query(..., min_length=1)):
    parametros = {"query": f'artist:"{q}" OR releasegroup:"{q}"', "fmt": "json", "limit": 10}
    cabeceras = {"User-Agent": USER_AGENT}

    respuesta = requests.get(MUSICBRAINZ_URL, params=parametros, headers=cabeceras, timeout=6)
    respuesta.raise_for_status()
    datos = respuesta.json()

    resultados = []
    for grupo in datos.get("release-groups", []):
        artista = grupo["artist-credit"][0]["name"] if grupo.get("artist-credit") else "Desconocido"
        anio = int(grupo["first-release-date"][:4]) if grupo.get("first-release-date") else None

        resultados.append({
            "id_musicbrainz": grupo.get("id"),
            "titulo": grupo.get("title"),
            "artista": artista,
            "lanzamiento": anio,
            "url_portada": f"https://coverartarchive.org/release-group/{grupo.get('id')}/front-250",
        })

    return resultados


@router.get("/canciones/{id_musicbrainz}")
def obtener_canciones(id_musicbrainz: str):
    parametros = {"release-group": id_musicbrainz, "inc": "recordings", "fmt": "json", "limit": 1}
    cabeceras = {"User-Agent": USER_AGENT}

    respuesta = requests.get(MUSICBRAINZ_RELEASE_URL, params=parametros, headers=cabeceras, timeout=6)
    respuesta.raise_for_status()
    datos = respuesta.json()

    releases = datos.get("releases", [])
    if not releases:
        return []

    canciones = []
    for medio in releases[0].get("media", []):
        for pista in medio.get("tracks", []):
            canciones.append({
                "posicion": pista.get("position"),
                "titulo": pista.get("title"),
                "duracion_ms": pista.get("length"),
            })

    return canciones
