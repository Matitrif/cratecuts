from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from database import Base

class Album(Base):
    __tablename__ = "albums"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    artist = Column(String, nullable=False)
    genre = Column(String)
    release_year = Column(Integer)
    cover_url = Column(String)
    musicbrainz_id = Column(String, unique=True)

    reviews = relationship("Review", back_populates="album")