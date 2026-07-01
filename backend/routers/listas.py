from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

from database import get_db
from models.lista import Lista, ListaAlbum
from models.album import Album
from models.user import User
from schemas.lista import ListaCrear, ListaActualizar, ListaSalida, ListaResumen, ListaReciente, AnadirAlbum
from dependencies import obtener_usuario_actual, obtener_usuario_opcional

router = APIRouter()


def construir_salida(lista: Lista) -> ListaSalida:
    return ListaSalida(
        id=lista.id,
        id_usuario=lista.id_usuario,
        titulo=lista.titulo,
        descripcion=lista.descripcion,
        es_publica=lista.es_publica,
        creado_en=lista.creado_en,
        albumes=[elemento.album for elemento in lista.elementos],
    )


@router.post("/", response_model=ListaSalida)
def crear_lista(
    datos: ListaCrear,
    usuario_actual: User = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db),
):
    nueva_lista = Lista(**datos.model_dump(), id_usuario=usuario_actual.id)
    db.add(nueva_lista)
    db.commit()
    db.refresh(nueva_lista)
    return construir_salida(nueva_lista)


@router.get("/", response_model=List[ListaResumen])
def listar_listas(
    id_usuario: Optional[int] = None,
    usuario_actual: Optional[User] = Depends(obtener_usuario_opcional),
    db: Session = Depends(get_db),
):
    query = db.query(Lista)
    if id_usuario is not None:
        query = query.filter(Lista.id_usuario == id_usuario)

    es_propio = usuario_actual is not None and usuario_actual.id == id_usuario
    if not es_propio:
        query = query.filter(Lista.es_publica.is_(True))

    listas = query.order_by(Lista.creado_en.desc()).all()
    conteos = dict(
        db.query(ListaAlbum.id_lista, func.count(ListaAlbum.id))
        .group_by(ListaAlbum.id_lista)
        .all()
    )
    return [
        ListaResumen(
            id=lista.id,
            id_usuario=lista.id_usuario,
            titulo=lista.titulo,
            descripcion=lista.descripcion,
            es_publica=lista.es_publica,
            creado_en=lista.creado_en,
            num_albumes=conteos.get(lista.id, 0),
        )
        for lista in listas
    ]


@router.get("/recientes", response_model=List[ListaReciente])
def listas_recientes(db: Session = Depends(get_db)):
    listas = (
        db.query(Lista)
        .filter(Lista.es_publica.is_(True))
        .order_by(Lista.creado_en.desc())
        .limit(8)
        .all()
    )
    salida = []
    for lista in listas:
        albumes = [elemento.album for elemento in lista.elementos[:4]]
        if not albumes:
            continue
        salida.append(
            ListaReciente(
                id=lista.id,
                id_usuario=lista.id_usuario,
                nombre_usuario=lista.usuario.nombreusuario,
                titulo=lista.titulo,
                albumes=albumes,
            )
        )
    return salida


@router.get("/{id_lista}", response_model=ListaSalida)
def obtener_lista(
    id_lista: int,
    usuario_actual: Optional[User] = Depends(obtener_usuario_opcional),
    db: Session = Depends(get_db),
):
    lista = db.query(Lista).filter(Lista.id == id_lista).first()
    if not lista:
        raise HTTPException(status_code=404, detail="Lista no encontrada")

    es_propio = usuario_actual is not None and usuario_actual.id == lista.id_usuario
    if not lista.es_publica and not es_propio:
        raise HTTPException(status_code=404, detail="Lista no encontrada")

    return construir_salida(lista)


@router.put("/{id_lista}", response_model=ListaSalida)
def actualizar_lista(
    id_lista: int,
    datos: ListaActualizar,
    usuario_actual: User = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db),
):
    lista = db.query(Lista).filter(Lista.id == id_lista).first()
    if not lista:
        raise HTTPException(status_code=404, detail="Lista no encontrada")
    if lista.id_usuario != usuario_actual.id:
        raise HTTPException(status_code=403, detail="No puedes editar la lista de otro usuario")

    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(lista, campo, valor)

    db.commit()
    db.refresh(lista)
    return construir_salida(lista)


@router.delete("/{id_lista}")
def eliminar_lista(
    id_lista: int,
    usuario_actual: User = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db),
):
    lista = db.query(Lista).filter(Lista.id == id_lista).first()
    if not lista:
        raise HTTPException(status_code=404, detail="Lista no encontrada")
    if lista.id_usuario != usuario_actual.id:
        raise HTTPException(status_code=403, detail="No puedes eliminar la lista de otro usuario")

    db.delete(lista)
    db.commit()
    return {"mensaje": "Lista eliminada correctamente"}


@router.post("/{id_lista}/albumes", response_model=ListaSalida)
def anadir_album(
    id_lista: int,
    datos: AnadirAlbum,
    usuario_actual: User = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db),
):
    lista = db.query(Lista).filter(Lista.id == id_lista).first()
    if not lista:
        raise HTTPException(status_code=404, detail="Lista no encontrada")
    if lista.id_usuario != usuario_actual.id:
        raise HTTPException(status_code=403, detail="No puedes editar la lista de otro usuario")

    album = db.query(Album).filter(Album.id == datos.id_album).first()
    if not album:
        raise HTTPException(status_code=404, detail="Álbum no encontrado")

    existente = db.query(ListaAlbum).filter(
        ListaAlbum.id_lista == id_lista,
        ListaAlbum.id_album == datos.id_album,
    ).first()
    if not existente:
        maxima = db.query(func.max(ListaAlbum.posicion)).filter(
            ListaAlbum.id_lista == id_lista
        ).scalar()
        siguiente = (maxima + 1) if maxima is not None else 0
        db.add(ListaAlbum(id_lista=id_lista, id_album=datos.id_album, posicion=siguiente))
        db.commit()

    db.refresh(lista)
    return construir_salida(lista)


@router.delete("/{id_lista}/albumes/{id_album}", response_model=ListaSalida)
def quitar_album(
    id_lista: int,
    id_album: int,
    usuario_actual: User = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db),
):
    lista = db.query(Lista).filter(Lista.id == id_lista).first()
    if not lista:
        raise HTTPException(status_code=404, detail="Lista no encontrada")
    if lista.id_usuario != usuario_actual.id:
        raise HTTPException(status_code=403, detail="No puedes editar la lista de otro usuario")

    elemento = db.query(ListaAlbum).filter(
        ListaAlbum.id_lista == id_lista,
        ListaAlbum.id_album == id_album,
    ).first()
    if elemento:
        db.delete(elemento)
        db.commit()

    db.refresh(lista)
    return construir_salida(lista)
