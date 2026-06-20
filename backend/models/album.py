from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from database import Base

class Album(Base):
    __tablename__ = "albums"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, nullable=False)
    artista = Column(String, nullable=False)
    genero = Column(String)
    lanzamiento = Column(Integer)
    url_portada = Column(String)
    id_musicbrainz = Column(String, unique=True)

    reviews = relationship("Review", back_populates="album", cascade="all, delete-orphan")