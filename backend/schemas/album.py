from pydantic import BaseModel
from typing import Optional


class AlbumBase(BaseModel):
    titulo: str
    artista: str
    genero: Optional[str] = None
    lanzamiento: Optional[int] = None
    url_portada: Optional[str] = None
    id_musicbrainz: Optional[str] = None


class AlbumCrear(AlbumBase):
    pass


class AlbumActualizar(BaseModel):
    titulo: Optional[str] = None
    artista: Optional[str] = None
    genero: Optional[str] = None
    lanzamiento: Optional[int] = None
    url_portada: Optional[str] = None


class AlbumSalida(AlbumBase):
    id: int

    class Config:
        from_attributes = True