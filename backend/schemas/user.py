from pydantic import BaseModel, EmailStr
from typing import Optional


class UserBase(BaseModel):
    nombreusuario: str
    email: EmailStr


class UserCrear(UserBase):
    password: str


class UserActualizar(BaseModel):
    biografia: Optional[str] = None


class UserSalida(UserBase):
    id: int
    es_admin: bool
    biografia: Optional[str] = None
    foto_perfil: Optional[str] = None

    class Config:
        from_attributes = True