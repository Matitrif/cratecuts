import enum
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class StatusEnum(str, enum.Enum):
    wishlist = "wishlist"
    escuchando = "escuchando"
    completado = "completado"

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("users.id"), nullable=False)
    id_album = Column(Integer, ForeignKey("albums.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Float)
    nota = Column(String)
    estado = Column(Enum(StatusEnum), default=StatusEnum.wishlist)
    creado_en = Column(DateTime(timezone=True), server_default=func.now())
    actualizado_en = Column(DateTime(timezone=True), onupdate=func.now())

    usuario = relationship("User", back_populates="reviews")
    album = relationship("Album", back_populates="reviews")