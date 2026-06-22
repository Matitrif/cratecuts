from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from database import get_db
from dependencies import requerir_admin, obtener_usuario_actual
from models.album import Album
from models.review import Review
from models.user import User
from schemas.album import AlbumCrear, AlbumActualizar, AlbumSalida

router = APIRouter()

@router.get("/destacados")
def obtener_albumes_destacados(db: Session = Depends(get_db)):
    resultados = (
        db.query(
            Album,
            func.avg(Review.rating).label("promedio"),
            func.count(Review.id).label("num_reviews"),
        )
        .join(Review, Review.id_album == Album.id)
        .filter(Review.rating.isnot(None))
        .group_by(Album.id)
        .order_by(func.avg(Review.rating).desc())
        .limit(6)
        .all()
    )
    return [
        {
            "id": album.id,
            "titulo": album.titulo,
            "artista": album.artista,
            "url_portada": album.url_portada,
            "lanzamiento": album.lanzamiento,
            "promedio": round(float(promedio), 2) if promedio else None,
            "num_reviews": num_reviews,
        }
        for album, promedio, num_reviews in resultados
    ]


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


@router.get("/por-mb/{id_musicbrainz}", response_model=AlbumSalida)
def obtener_album_por_mb(id_musicbrainz: str, db: Session = Depends(get_db)):
    album = db.query(Album).filter(Album.id_musicbrainz == id_musicbrainz).first()
    if not album:
        raise HTTPException(status_code=404, detail="Álbum no encontrado")
    return album


@router.get("/{id_album}", response_model=AlbumSalida)
def obtener_album(id_album: int, db: Session = Depends(get_db)):
    album = db.query(Album).filter(Album.id == id_album).first()
    if not album:
        raise HTTPException(status_code=404, detail="Álbum no encontrado")
    return album


@router.put("/{id_album}", response_model=AlbumSalida)
def actualizar_album(id_album: int, datos: AlbumActualizar, db: Session = Depends(get_db), _: User = Depends(requerir_admin)):
    album = db.query(Album).filter(Album.id == id_album).first()
    if not album:
        raise HTTPException(status_code=404, detail="Álbum no encontrado")

    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(album, campo, valor)

    db.commit()
    db.refresh(album)
    return album


@router.delete("/{id_album}")
def eliminar_album(id_album: int, db: Session = Depends(get_db), _: User = Depends(obtener_usuario_actual)):
    album = db.query(Album).filter(Album.id == id_album).first()
    if not album:
        raise HTTPException(status_code=404, detail="Álbum no encontrado")

    db.delete(album)
    db.commit()
    return {"mensaje": "Álbum eliminado correctamente"}