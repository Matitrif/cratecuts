from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models.album import Album
from schemas.album import AlbumCrear, AlbumActualizar, AlbumSalida

router = APIRouter()

@router.post("/", response_model=AlbumSalida)
def crear_album(album: AlbumCrear, db: Session = Depends(get_db)):
    if album.id_musicbrainz:
        existente = db.query(Album).filter(Album.id_musicbrainz == album.id_musicbrainz).first()
        if existente:
            return existente

    nuevo_album = Album(**album.model_dump())
    db.add(nuevo_album)
    db.commit()
    db.refresh(nuevo_album)
    return nuevo_album


@router.get("/", response_model=List[AlbumSalida])
def listar_albumes(db: Session = Depends(get_db)):
    return db.query(Album).all()


@router.get("/{id_album}", response_model=AlbumSalida)
def obtener_album(id_album: int, db: Session = Depends(get_db)):
    album = db.query(Album).filter(Album.id == id_album).first()
    if not album:
        raise HTTPException(status_code=404, detail="Álbum no encontrado")
    return album


@router.put("/{id_album}", response_model=AlbumSalida)
def actualizar_album(id_album: int, datos: AlbumActualizar, db: Session = Depends(get_db)):
    album = db.query(Album).filter(Album.id == id_album).first()
    if not album:
        raise HTTPException(status_code=404, detail="Álbum no encontrado")

    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(album, campo, valor)

    db.commit()
    db.refresh(album)
    return album


@router.delete("/{id_album}")
def eliminar_album(id_album: int, db: Session = Depends(get_db)):
    album = db.query(Album).filter(Album.id == id_album).first()
    if not album:
        raise HTTPException(status_code=404, detail="Álbum no encontrado")

    db.delete(album)
    db.commit()
    return {"mensaje": "Álbum eliminado correctamente"}