from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from database import get_db
from models.user import User
from schemas.user import UserCrear, UserSalida

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@router.post("/", response_model=UserSalida)
def crear_usuario(usuario: UserCrear, db: Session = Depends(get_db)):
    existe = db.query(User).filter(
        (User.email == usuario.email) | (User.nombreusuario == usuario.nombreusuario)
    ).first()
    if existe:
        raise HTTPException(status_code=400, detail="El usuario o email ya existe")

    hash_contrasena = pwd_context.hash(usuario.password)
    nuevo_usuario = User(
        nombreusuario=usuario.nombreusuario,
        email=usuario.email,
        password_hash=hash_contrasena,
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