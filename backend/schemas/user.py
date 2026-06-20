from pydantic import BaseModel, EmailStr
from typing import Optional


class UserBase(BaseModel):
    nombreusuario: str
    email: EmailStr


class UserCrear(UserBase):
    password: str


class UserSalida(UserBase):
    id: int
    es_admin: bool

    class Config:
        from_attributes = True