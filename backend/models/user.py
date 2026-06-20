from sqlalchemy import Boolean, Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nombreusuario = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    es_admin = Column(Boolean, default=False, nullable=False)
    creado_en = Column(DateTime(timezone=True), server_default=func.now())

    reviews = relationship("Review", back_populates="usuario")