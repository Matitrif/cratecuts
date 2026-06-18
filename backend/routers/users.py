from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from schemas.user import UserCrear, UserSalida
from seguridad import hash_password

router = APIRouter()

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