from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Lista(Base):
    __tablename__ = "listas"

    id = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("users.id"), nullable=False)
    titulo = Column(String, nullable=False)
    descripcion = Column(String, nullable=True)
    es_publica = Column(Boolean, default=True, nullable=False)
    creado_en = Column(DateTime(timezone=True), server_default=func.now())

    usuario = relationship("User", back_populates="listas")
    elementos = relationship(
        "ListaAlbum",
        back_populates="lista",
        cascade="all, delete-orphan",
        order_by="ListaAlbum.posicion",
    )


class ListaAlbum(Base):
    __tablename__ = "lista_albumes"
    __table_args__ = (UniqueConstraint("id_lista", "id_album", name="uq_lista_album"),)

    id = Column(Integer, primary_key=True, index=True)
    id_lista = Column(Integer, ForeignKey("listas.id", ondelete="CASCADE"), nullable=False)
    id_album = Column(Integer, ForeignKey("albums.id", ondelete="CASCADE"), nullable=False)
    posicion = Column(Integer, nullable=False, default=0)

    lista = relationship("Lista", back_populates="elementos")
    album = relationship("Album")
