import os
import uuid
import requests
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from database import get_db
from dependencies import obtener_usuario_actual
from models.user import User
from schemas.user import UserCrear, UserSalida, UserActualizar
from seguridad import hash_password

router = APIRouter()

TIPOS_PERMITIDOS = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
}
TAMANO_MAXIMO = 10 * 1024 * 1024


@router.post("/", response_model=UserSalida)
def crear_usuario(usuario: UserCrear, db: Session = Depends(get_db)):
    existe = db.query(User).filter(
        (User.email == usuario.email) | (User.nombreusuario == usuario.nombreusuario)
    ).first()
    if existe:
        raise HTTPException(status_code=400, detail="El usuario o email ya existe")

    nuevo_usuario = User(
        nombreusuario=usuario.nombreusuario,
        email=usuario.email,
        password_hash=hash_password(usuario.password),
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return nuevo_usuario


@router.get("/{id_usuario}", response_model=UserSalida)
def obtener_usuario(id_usuario: int, db: Session = Depends(get_db)):
    usuario = db.query(User).filter(User.id == id_usuario).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario


@router.put("/me", response_model=UserSalida)
def actualizar_perfil(
    datos: UserActualizar,
    usuario_actual: User = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db),
):
    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(usuario_actual, campo, valor)
    db.commit()
    db.refresh(usuario_actual)
    return usuario_actual


@router.post("/me/foto", response_model=UserSalida)
def subir_foto_perfil(
    foto: UploadFile = File(...),
    usuario_actual: User = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db),
):
    tipo_base = (foto.content_type or "").split(";")[0].strip().lower()
    if tipo_base not in TIPOS_PERMITIDOS:
        raise HTTPException(status_code=400, detail="Solo se permiten imágenes JPEG, PNG o WebP")

    contenido = foto.file.read()
    if len(contenido) > TAMANO_MAXIMO:
        raise HTTPException(status_code=400, detail="La imagen no puede superar 10 MB")

    extension = TIPOS_PERMITIDOS[tipo_base]
    nombre_archivo = f"{uuid.uuid4()}.{extension}"

    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_KEY")

    url_subida = f"{supabase_url}/storage/v1/object/avatars/{nombre_archivo}"
    cabeceras = {
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": foto.content_type,
        "x-upsert": "true",
    }
    respuesta = requests.post(url_subida, headers=cabeceras, data=contenido)
    if not respuesta.ok:
        raise HTTPException(status_code=500, detail="Error al subir la imagen al almacenamiento")

    foto_url = f"{supabase_url}/storage/v1/object/public/avatars/{nombre_archivo}"
    usuario_actual.foto_perfil = foto_url
    db.commit()
    db.refresh(usuario_actual)
    return usuario_actual
