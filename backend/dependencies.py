from typing import Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from seguridad import decodificar_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def obtener_usuario_actual(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credenciales_invalidas = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decodificar_token(token)
    if payload is None:
        raise credenciales_invalidas

    id_usuario = payload.get("sub")
    if id_usuario is None:
        raise credenciales_invalidas

    usuario = db.query(User).filter(User.id == int(id_usuario)).first()
    if usuario is None:
        raise credenciales_invalidas

    return usuario


def obtener_usuario_opcional(request: Request, db: Session = Depends(get_db)) -> Optional[User]:
    cabecera = request.headers.get("Authorization")
    if not cabecera or not cabecera.lower().startswith("bearer "):
        return None

    token = cabecera.split(" ", 1)[1]
    payload = decodificar_token(token)
    if payload is None:
        return None

    id_usuario = payload.get("sub")
    if id_usuario is None:
        return None

    return db.query(User).filter(User.id == int(id_usuario)).first()


def requerir_admin(usuario_actual: User = Depends(obtener_usuario_actual)) -> User:
    if not usuario_actual.es_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requieren permisos de administrador",
        )
    return usuario_actual