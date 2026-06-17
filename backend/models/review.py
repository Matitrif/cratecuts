import enum
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class StatusEnum(str, enum.Enum):
    wishlist = "wishlist"
    listening = "listening"
    completed = "completed"

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    album_id = Column(Integer, ForeignKey("albums.id"), nullable=False)
    rating = Column(Float)
    note = Column(String)
    status = Column(Enum(StatusEnum), default=StatusEnum.wishlist)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="reviews")
    album = relationship("Album", back_populates="reviews")