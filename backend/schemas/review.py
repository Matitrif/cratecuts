from pydantic import BaseModel
from typing import Optional
from models.review import StatusEnum

class ReviewBase(BaseModel):
    id_album: int
    rating: Optional[float] = None
    nota: Optional[str] = None
    estado: StatusEnum = StatusEnum.completado

class ReviewCrear(ReviewBase):
    pass

class ReviewActualizar(BaseModel):
    rating: Optional[float] = None
    nota: Optional[str] = None
    estado: Optional[StatusEnum] = None

class ReviewSalida(ReviewBase):
    id: int
    id_usuario: int

    class Config:
        from_attributes = True


class ReviewPublica(BaseModel):
    id: int
    id_album: int
    id_usuario: int
    rating: Optional[float] = None
    nota: Optional[str] = None

    class Config:
        from_attributes = True