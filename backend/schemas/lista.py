from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from schemas.album import AlbumSalida


class ListaCrear(BaseModel):
    titulo: str
    descripcion: Optional[str] = None
    es_publica: bool = True


class ListaActualizar(BaseModel):
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    es_publica: Optional[bool] = None


class AnadirAlbum(BaseModel):
    id_album: int


class ListaResumen(BaseModel):
    id: int
    id_usuario: int
    titulo: str
    descripcion: Optional[str] = None
    es_publica: bool
    creado_en: Optional[datetime] = None
    num_albumes: int = 0

    class Config:
        from_attributes = True


class ListaReciente(BaseModel):
    id: int
    id_usuario: int
    nombre_usuario: str
    titulo: str
    albumes: List[AlbumSalida] = []

    class Config:
        from_attributes = True


class ListaSalida(BaseModel):
    id: int
    id_usuario: int
    titulo: str
    descripcion: Optional[str] = None
    es_publica: bool
    creado_en: Optional[datetime] = None
    albumes: List[AlbumSalida] = []

    class Config:
        from_attributes = True
